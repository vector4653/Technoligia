import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ShipperDashboard = () => {
    // ... existing code ...

    const { user } = useAuth();
    const [loads, setLoads] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ origin: '', destination: '', cargoType: '', maxPrice: '' });

    const fetchLoads = async () => {
        try {
            const res = await axios.get('/api/loads');
            setLoads(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchLoads();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/loads', formData);
            setShowForm(false);
            setFormData({ origin: '', destination: '', cargoType: '', maxPrice: '' });
            fetchLoads();
        } catch (err) {
            alert(err.response?.data?.message || 'Error creating load');
        }
    };

    const handleAcceptBid = async (loadId, bidId) => {
        try {
            await axios.post('/api/loads/accept-bid', { loadId, bidId });
            fetchLoads();
        } catch (err) {
            alert(err.response?.data?.message || 'Error accepting bid');
        }
    };

    return (
        <div className="flex bg-gray-50 dark:bg-slate-950 min-h-screen pb-20 md:pb-0 transition-colors duration-200">
            <Sidebar role="SHIPPER" />
            <MobileNav />
            <div className="flex-1 md:ml-64 p-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">My Shipments</h1>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition shadow-lg"
                    >
                        {showForm ? 'Cancel' : '+ Post New Load'}
                    </button>
                </div>

                {showForm && (
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg mb-8 border border-gray-100 dark:border-slate-800 animate-fade-in transition-colors duration-200">
                        <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-slate-300">Create New Shipment</h2>
                        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <input placeholder="Origin" className="p-3 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" required value={formData.origin} onChange={e => setFormData({ ...formData, origin: e.target.value })} />
                            <input placeholder="Destination" className="p-3 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" required value={formData.destination} onChange={e => setFormData({ ...formData, destination: e.target.value })} />
                            <input placeholder="Cargo Type" className="p-3 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" required value={formData.cargoType} onChange={e => setFormData({ ...formData, cargoType: e.target.value })} />
                            <input type="number" placeholder="Max Price ($)" className="p-3 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" required value={formData.maxPrice} onChange={e => setFormData({ ...formData, maxPrice: e.target.value })} />
                            <button type="submit" className="md:col-span-4 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition">Post Load</button>
                        </form>
                    </div>
                )}

                <div className="space-y-12">

                    {/* Active Deliveries Section */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                            Active Deliveries
                        </h2>
                        <div className="grid gap-6">
                            {loads.filter(l => l.status === 'IN_TRANSIT').length === 0 ? (
                                <p className="text-gray-400 italic">No deliveries in progress.</p>
                            ) : (
                                loads.filter(l => l.status === 'IN_TRANSIT').map(load => (
                                    <LoadCard key={load.id} load={load} handleAcceptBid={handleAcceptBid} />
                                ))
                            )}
                        </div>
                    </section>

                    {/* Pending Deliveries Section */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                            <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                            Pending Pickup & Closures
                        </h2>
                        <div className="grid gap-6">
                            {loads.filter(l => ['ASSIGNED', 'DELIVERED', 'PAID'].includes(l.status)).length === 0 ? (
                                <p className="text-gray-400 italic">No pending tasks.</p>
                            ) : (
                                loads.filter(l => ['ASSIGNED', 'DELIVERED', 'PAID'].includes(l.status)).map(load => (
                                    <LoadCard key={load.id} load={load} handleAcceptBid={handleAcceptBid} />
                                ))
                            )}
                        </div>
                    </section>

                    {/* Bidding Section */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                            <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                            In Bidding
                        </h2>
                        <div className="grid gap-6">
                            {loads.filter(l => ['OPEN', 'BIDDING'].includes(l.status)).length === 0 ? (
                                <p className="text-gray-400 italic">No open loads for bidding.</p>
                            ) : (
                                loads.filter(l => ['OPEN', 'BIDDING'].includes(l.status)).map(load => (
                                    <LoadCard key={load.id} load={load} handleAcceptBid={handleAcceptBid} />
                                ))
                            )}
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
};

const LoadCard = ({ load, handleAcceptBid }) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 hover:shadow-md transition-all duration-200">
        <div className="flex justify-between items-start">
            <div>
                <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase 
                    ${load.status === 'OPEN' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                            load.status === 'BIDDING' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                                'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'}`}>
                        {load.status}
                    </span>
                    <span className="text-gray-400 text-sm">#{load.id}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">{load.origin} → {load.destination}</h3>
                <p className="text-gray-500 dark:text-slate-400 mt-1">{load.cargoType} • Max: ${load.maxPrice}</p>
            </div>
            {load.status === 'ASSIGNED' && (
                <div className="text-right">
                    <p className="text-sm font-bold text-gray-500 dark:text-slate-400">Pickup OTP</p>
                    <p className="text-2xl font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">{load.pickupOtp}</p>
                </div>
            )}
            {load.status === 'IN_TRANSIT' && (
                <div className="text-right">
                    <p className="text-sm font-bold text-gray-500 dark:text-slate-400">Delivery OTP</p>
                    <p className="text-2xl font-mono text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">{load.deliveryOtp}</p>
                </div>
            )}
        </div>

        {/* Bids Section */}
        {(load.status === 'OPEN' || load.status === 'BIDDING') && load.bids && load.bids.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-800">
                <h4 className="text-sm font-bold text-gray-400 uppercase mb-3">Incoming Bids ({load.bids.length})</h4>
                <div className="space-y-3">
                    {load.bids.map(bid => (
                        <div key={bid.id} className="flex justify-between items-center bg-gray-50 dark:bg-slate-800 p-3 rounded-lg">
                            <div>
                                <p className="font-bold text-gray-800 dark:text-white">${bid.amount}</p>
                                <p className="text-xs text-gray-500 dark:text-slate-400">{bid.bidder?.email}</p>
                            </div>
                            {bid.status === 'PENDING' && (
                                <button
                                    onClick={() => handleAcceptBid(load.id, bid.id)}
                                    className="bg-slate-800 text-white px-4 py-2 rounded text-sm hover:bg-slate-700 transition"
                                >
                                    Accept
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
);

export default ShipperDashboard;
