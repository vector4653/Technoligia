const { sequelize, User, Load, Bid } = require('./src/models');
const bcrypt = require('bcryptjs');

async function seed() {
    try {
        await sequelize.sync({ force: true }); // WARNING: This drops tables!
        console.log('Database synced (force: true)');

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('1234', salt);

        // 1. Create Users
        const users = await User.bulkCreate([
            { email: 'shipper@test.com', password: passwordHash, role: 'SHIPPER' },
            { email: 'fleet@test.com', password: passwordHash, role: 'FLEET' },
            { email: 'driver@test.com', password: passwordHash, role: 'DRIVER' },
        ]);
        console.log('Users created');

        const shipper = users[0];
        const fleet = users[1];

        // 2. Create Dummy Loads
        const loads = await Load.bulkCreate([
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
                status: 'BIDDING',
            },
            {
                shipperId: shipper.id,
                origin: 'Denver, CO',
                destination: 'Phoenix, AZ',
                cargoType: 'Food',
                maxPrice: 1200,
                status: 'ASSIGNED',
                assignedToFleetId: fleet.id,
                winningBidAmount: 1100,
                pickupOtp: '123456',
                deliveryOtp: '654321',
            },
            {
                shipperId: shipper.id,
                origin: 'Boston, MA',
                destination: 'Austin, TX',
                cargoType: 'Chemicals',
                maxPrice: 6000,
                status: 'DELIVERED',
                assignedToFleetId: fleet.id,
                winningBidAmount: 5800,
                pickupOtp: '111111',
                deliveryOtp: '222222',
            },
        ]);
        console.log('Loads created');

        // 3. Create Dummy Bids
        await Bid.bulkCreate([
            { loadId: loads[2].id, fleetId: fleet.id, amount: 4400, status: 'PENDING' },
            { loadId: loads[2].id, fleetId: fleet.id, amount: 4300, status: 'PENDING' },
        ]);
        console.log('Bids created');

        console.log('Seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
}

seed();
