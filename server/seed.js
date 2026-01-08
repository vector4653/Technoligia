const { sequelize, User, Load, Bid } = require('./src/models');
const bcrypt = require('bcryptjs');

async function seed() {
    try {
        await sequelize.sync({ force: true }); // WARNING: This drops tables!
        console.log('Database synced (force: true)');

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('1234', salt);

        // 1. Create Users with Wallet Balances
        const users = await User.bulkCreate([
            { email: 'shipper@test.com', password: passwordHash, role: 'SHIPPER', wallet_balance: 50000.00 },
            { email: 'fleet@test.com', password: passwordHash, role: 'FLEET', wallet_balance: 12500.00 },
        ]);

        const shipper = users[0];
        const fleet = users[1];

        // Create Driver associated with Fleet
        const driver = await User.create({
            email: 'driver@test.com',
            password: passwordHash,
            role: 'DRIVER',
            wallet_balance: 50.00,
            fleetId: fleet.id
        });

        // 2. Create Loads with Context
        const loads = await Load.bulkCreate([
            // Shipper has 3 OPEN loads
            {
                shipperId: shipper.id,
                origin: 'New York, NY',
                destination: 'Los Angeles, CA',
                cargoType: 'Electronics',
                maxPrice: 5000,
                status: 'OPEN',
            },
            {
                shipperId: shipper.id,
                origin: 'Chicago, IL',
                destination: 'Miami, FL',
                cargoType: 'Furniture',
                maxPrice: 3000,
                status: 'OPEN',
            },
            {
                shipperId: shipper.id,
                origin: 'Dallas, TX',
                destination: 'Seattle, WA',
                cargoType: 'Machinery',
                maxPrice: 4500,
                status: 'OPEN',
            },

            // Driver has 1 active load
            {
                shipperId: shipper.id,
                origin: 'Denver, CO',
                destination: 'Phoenix, AZ',
                cargoType: 'Food',
                maxPrice: 1200,
                status: 'IN_TRANSIT',
                assignedToFleetId: fleet.id,
                assignedToDriverId: driver.id,
                winningBidAmount: 1100,
                pickupOtp: '123456',
                deliveryOtp: '654321',
            },
        ]);
        console.log('Loads created');

        // 3. Create Dummy Bids
        // Bid on one of the open loads (e.g., the NY to LA one, loads[0])
        await Bid.create({ loadId: loads[0].id, fleetId: fleet.id, amount: 4800, status: 'PENDING' });

        console.log('Bids created');
        console.log('Seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
}

seed();
