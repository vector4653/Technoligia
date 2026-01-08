const { Load, Bid, User, sequelize } = require('../models');
const { generateOTP } = require('../utils/otpGenerator');

exports.createLoad = async (req, res) => {
    try {
        // Only Shippers can create loads
        if (req.user.role !== 'SHIPPER') return res.status(403).json({ message: 'Only shippers can post loads' });

        // FIX: Destructure only the allowed fields to prevent Mass Assignment attacks
        const { origin, destination, cargoType, weight, maxPrice, pickupDate, deliveryDate } = req.body;

        const load = await Load.create({
            origin,
            destination,
            cargoType,
            weight,
            maxPrice,
            pickupDate,
            deliveryDate,
            shipperId: req.user.id,
            status: 'OPEN' // Force status to OPEN regardless of input
        });
        res.status(201).json(load);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getLoads = async (req, res) => {
    try {
        const { role, id } = req.user;
        let where = {};

        if (role === 'SHIPPER') {
            where = { shipperId: id };
        } else if (role === 'FLEET') {
            const { Op } = require('sequelize');
            where = {
                [Op.or]: [
                    { status: ['OPEN', 'BIDDING'] },
                    { assignedToFleetId: id }
                ]
            };
        } else if (role === 'DRIVER') {
            const { Op } = require('sequelize');
            const driver = await User.findByPk(id);
            where = {
                [Op.or]: [
                    { assignedToDriverId: id },
                    {
                        assignedToFleetId: driver.fleetId,
                        assignedToDriverId: null,
                        status: 'ASSIGNED'
                    }
                ]
            };
        }

        // FIX: Secure the include array to prevent leaking competitor emails
        let includeOptions = [
            { model: User, as: 'shipper', attributes: ['email'] }
        ];

        if (role === 'SHIPPER') {
            // Shippers can see who is bidding
            includeOptions.push({
                model: Bid,
                as: 'bids',
                include: [{ model: User, as: 'bidder', attributes: ['email'] }]
            });
        } else if (role === 'FLEET') {
            // Fleets see amounts to compete, but NOT who the bidder is (Blind Auction)
            includeOptions.push({
                model: Bid,
                as: 'bids',
                attributes: ['amount', 'createdAt'] // Excludes 'bidder' model entirely
            });
        }

        const loads = await Load.findAll({
            where,
            include: includeOptions,
            order: [['createdAt', 'DESC']]
        });

        res.json(loads);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.acceptBid = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { loadId, bidId } = req.body;

        // FIX: Add Database Lock to prevent Race Conditions (Double Assignment)
        const load = await Load.findByPk(loadId, {
            lock: t.LOCK.UPDATE,
            transaction: t
        });

        if (!load) return res.status(404).json({ message: 'Load not found' });
        if (load.shipperId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

        // Strict check: Status MUST be OPEN or BIDDING. 
        if (load.status !== 'OPEN' && load.status !== 'BIDDING') {
            await t.rollback();
            return res.status(400).json({ message: 'Load not open for assignment' });
        }

        const bid = await Bid.findByPk(bidId, { transaction: t });
        if (!bid) {
            await t.rollback();
            return res.status(404).json({ message: 'Bid not found' });
        }

        await load.update({
            status: 'ASSIGNED',
            assignedToFleetId: bid.fleetId,
            assignedToDriverId: null,
            winningBidAmount: bid.amount,
            pickupOtp: generateOTP(),
            deliveryOtp: generateOTP(),
        }, { transaction: t });

        await bid.update({ status: 'ACCEPTED' }, { transaction: t });

        const { Op } = require('sequelize');
        await Bid.update({ status: 'REJECTED' }, {
            where: {
                loadId,
                id: { [Op.ne]: bidId }
            },
            transaction: t
        });

        await t.commit();
        res.json({ message: 'Bid accepted', load });

    } catch (err) {
        await t.rollback();
        res.status(500).json({ error: err.message });
    }
};

exports.verifyOtp = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        if (req.user.role !== 'DRIVER') {
            await t.rollback();
            return res.status(403).json({ message: 'Only drivers can verify OTP' });
        }

        const { loadId } = req.params;
        const { otp } = req.body;

        const load = await Load.findByPk(loadId, {
            include: [{ model: User, as: 'shipper' }],
            transaction: t,
            lock: t.LOCK.UPDATE
        });

        if (!load) {
            await t.rollback();
            return res.status(404).json({ message: 'Load not found' });
        }

        // FIX: Prevent other drivers from interfering with loads they don't own
        if (load.assignedToDriverId !== req.user.id) {
            await t.rollback();
            return res.status(403).json({ message: 'You are not assigned to this load' });
        }

        let nextStatus = '';

        if (load.status === 'ASSIGNED') {
            if (String(load.pickupOtp).trim() !== String(otp).trim()) {
                await t.rollback();
                return res.status(400).json({ message: 'Invalid Pickup OTP' });
            }
            nextStatus = 'IN_TRANSIT';
            // FIX: Clear OTP so it can't be reused
            await load.update({ status: nextStatus, pickupOtp: null }, { transaction: t });

        } else if (load.status === 'IN_TRANSIT') {
            if (String(load.deliveryOtp).trim() !== String(otp).trim()) {
                await t.rollback();
                return res.status(400).json({ message: 'Invalid Delivery OTP' });
            }
            nextStatus = 'DELIVERED';

            // WALLET TRANSFER LOGIC
            const amount = Number(load.winningBidAmount);
            const shipper = load.shipper;
            const fleet = await User.findByPk(load.assignedToFleetId, { transaction: t, lock: t.LOCK.UPDATE });

            if (!shipper || !fleet) {
                await t.rollback();
                return res.status(500).json({ message: 'User data integrity error' });
            }

            if (Number(shipper.wallet_balance) < amount) {
                // In a real app we might handle debt, here we just allow it to go negative or fail.
                // For simplified flow, we allow it.
            }

            // Update balances
            await shipper.decrement('wallet_balance', { by: amount, transaction: t });
            await fleet.increment('wallet_balance', { by: amount, transaction: t });

            // Mark as Paid immediately for simplicity or keep as DELIVERED? 
            // The prompt says "wallet money should decrease when the delivery has been done".
            // So we'll do the transfer now.

            // FIX: Clear OTP so it can't be reused
            await load.update({ status: 'DELIVERED', deliveryOtp: null }, { transaction: t });
        } else {
            await t.rollback();
            return res.status(400).json({ message: 'Load not in a state for OTP verification' });
        }

        await t.commit();
        res.json({ message: `Load status updated to ${nextStatus}`, load });

    } catch (err) {
        if (t && !t.finished) await t.rollback(); // Check if transaction is still active
        res.status(500).json({ error: err.message });
    }
};

exports.acceptJob = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        if (req.user.role !== 'DRIVER') {
            await t.rollback();
            return res.status(403).json({ message: 'Only drivers can accept jobs' });
        }

        const { loadId } = req.params;

        // Lock the row for update to prevent race conditions
        const load = await Load.findByPk(loadId, {
            lock: t.LOCK.UPDATE,
            transaction: t
        });

        if (!load) {
            await t.rollback();
            return res.status(404).json({ message: 'Load not found' });
        }

        // Verify Load is available for this driver's fleet
        const driver = await User.findByPk(req.user.id, { transaction: t });

        if (load.assignedToFleetId !== driver.fleetId) {
            await t.rollback();
            return res.status(403).json({ message: 'This load does not belong to your fleet' });
        }

        if (load.assignedToDriverId) {
            await t.rollback();
            return res.status(400).json({ message: 'Load already assigned to a driver' });
        }

        await load.update({ assignedToDriverId: driver.id }, { transaction: t });

        await t.commit();
        res.json({ message: 'Job accepted successfully', load });

    } catch (err) {
        await t.rollback();
        res.status(500).json({ error: err.message });
    }
};
