const { User, Load, Bid } = require('../models');
const { Op } = require('sequelize');

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['id', 'email', 'role', 'wallet_balance'] // Return real balance
        });
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getMyActiveLoad = async (req, res) => {
    try {
        const { id, role } = req.user;
        let status_text = "";

        if (role === 'DRIVER') {
            // Find the load currently assigned to this driver
            const load = await Load.findOne({
                where: {
                    assignedToDriverId: id,
                    status: { [Op.in]: ['ASSIGNED', 'IN_TRANSIT'] }
                }
            });

            if (load) {
                status_text = `You have an active load going to ${load.destination}. The status is ${load.status}.`;
            } else {
                status_text = "You have no active loads right now. Enjoy your break.";
            }

        } else if (role === 'SHIPPER') {
            // Count open loads
            const count = await Load.count({ where: { shipperId: id, status: 'OPEN' } });
            status_text = `You have ${count} loads currently open for bidding.`;

        } else if (role === 'FLEET') {
            // Count active bids
            const activeBids = await Bid.count({ where: { fleetId: id, status: 'PENDING' } });
            status_text = `You have ${activeBids} pending bids in the marketplace.`;
        }

        res.json({ status_text });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.addFunds = async (req, res) => {
    try {
        console.log(`[AddFunds] Request from user ${req.user.id} with amount ${req.body.amount}`);
        const { amount } = req.body;
        if (!amount || isNaN(amount) || amount <= 0) {
            console.log(`[AddFunds] Invalid amount: ${amount}`);
            return res.status(400).json({ message: "Invalid amount" });
        }

        const user = await User.findByPk(req.user.id);
        if (!user) {
            console.log(`[AddFunds] User not found: ${req.user.id}`);
            return res.status(404).json({ message: "User not found" });
        }

        user.wallet_balance = parseFloat(user.wallet_balance) + parseFloat(amount);
        await user.save();

        res.json({
            message: "Funds added successfully",
            new_balance: user.wallet_balance
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};