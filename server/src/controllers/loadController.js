const { Load, Bid, User, sequelize } = require('../models');
const { generateOTP } = require('../utils/otpGenerator');

exports.createLoad = async (req, res) => {
    try {
        // Only Shippers can create loads
        if (req.user.role !== 'SHIPPER') return res.status(403).json({ message: 'Only shippers can post loads' });

        const load = await Load.create({
            ...req.body,
            shipperId: req.user.id,
            status: 'OPEN'
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
            // Fleet sees OPEN/BIDDING loads to bid on, OR loads assigned to them
            const { Op } = require('sequelize');
            where = {
                [Op.or]: [
                    { status: ['OPEN', 'BIDDING'] },
                    { assignedToFleetId: id }
                ]
            };
        } else if (role === 'DRIVER') {
            where = { assignedToDriverId: id };
        }

        const loads = await Load.findAll({
            where,
            include: [
                { model: User, as: 'shipper', attributes: ['email'] },
                { model: Bid, as: 'bids', include: [{ model: User, as: 'bidder', attributes: ['email'] }] }
            ],
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
        const load = await Load.findByPk(loadId);

        if (!load) return res.status(404).json({ message: 'Load not found' });
        if (load.shipperId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
        if (load.status !== 'OPEN' && load.status !== 'BIDDING') return res.status(400).json({ message: 'Load not open for assignment' });

        const bid = await Bid.findByPk(bidId);
        if (!bid) return res.status(404).json({ message: 'Bid not found' });

        // Auto-assign to the first available driver (Hackathon Shortcut)
        // In a real app, the Fleet Manager would assign this via another API call.
        const driver = await User.findOne({ where: { role: 'DRIVER' } });

        // Update Load
        await load.update({
            status: 'ASSIGNED',
            assignedToFleetId: bid.fleetId,
            assignedToDriverId: driver ? driver.id : null, // Auto-assign if driver exists
            winningBidAmount: bid.amount,
            pickupOtp: generateOTP(),
            deliveryOtp: generateOTP(),
        }, { transaction: t });

        // Update Bids
        await bid.update({ status: 'ACCEPTED' }, { transaction: t });

        // Reject other bids
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

        let nextStatus = '';

        if (load.status === 'ASSIGNED') {
            if (load.pickupOtp !== otp) return res.status(400).json({ message: 'Invalid Pickup OTP' });
            nextStatus = 'IN_TRANSIT';
        } else if (load.status === 'IN_TRANSIT') {
            if (load.deliveryOtp !== otp) return res.status(400).json({ message: 'Invalid Delivery OTP' });
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
