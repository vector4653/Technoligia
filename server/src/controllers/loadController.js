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
    try {
        if (req.user.role !== 'DRIVER') return res.status(403).json({ message: 'Only drivers can verify OTP' });

        const { loadId } = req.params;
        const { otp } = req.body;

        const load = await Load.findByPk(loadId);
        if (!load) return res.status(404).json({ message: 'Load not found' });

        // FIX: Prevent other drivers from interfering with loads they don't own
        if (load.assignedToDriverId !== req.user.id) {
            return res.status(403).json({ message: 'You are not assigned to this load' });
        }

        let nextStatus = '';

        if (load.status === 'ASSIGNED') {
            if (String(load.pickupOtp).trim() !== String(otp).trim()) return res.status(400).json({ message: 'Invalid Pickup OTP' });
            nextStatus = 'IN_TRANSIT';
        } else if (load.status === 'IN_TRANSIT') {
            if (String(load.deliveryOtp).trim() !== String(otp).trim()) return res.status(400).json({ message: 'Invalid Delivery OTP' });
            nextStatus = 'DELIVERED';
        } else {
            return res.status(400).json({ message: 'Load not in a state for OTP verification' });
        }

        await load.update({ status: nextStatus });
        res.json({ message: `Load status updated to ${nextStatus}`, load });

    } catch (err) {
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
