const { Load, Bid } = require('../models');

exports.placeBid = async (req, res) => {
    try {
        if (req.user.role !== 'FLEET') return res.status(403).json({ message: 'Only Fleet Managers can bid' });

        const { loadId } = req.params;
        const { amount } = req.body;

        const load = await Load.findByPk(loadId);
        if (!load) return res.status(404).json({ message: 'Load not found' });

        if (load.status !== 'OPEN' && load.status !== 'BIDDING') {
            return res.status(400).json({ message: 'Load is not accepting bids' });
        }

        if (amount > load.maxPrice) {
            return res.status(400).json({ message: `Bid cannot exceed max price of $${load.maxPrice}` });
        }

        const bid = await Bid.create({
            loadId,
            fleetId: req.user.id,
            amount,
            status: 'PENDING'
        });

        // Update load status to BIDDING if it was OPEN
        if (load.status === 'OPEN') {
            await load.update({ status: 'BIDDING' });
        }

        res.status(201).json(bid);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
