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
            const res = await axios.get('http://localhost:5000/api/loads');
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
            await axios.post('http://localhost:5000/api/loads', formData);
            setShowForm(false);
            setFormData({ origin: '', destination: '', cargoType: '', maxPrice: '' });
            fetchLoads();
        } catch (err) {
            alert(err.response?.data?.message || 'Error creating load');
        }
    };

    const handleAcceptBid = async (loadId, bidId) => {
        try {
            await axios.post('http://localhost:5000/api/loads/accept-bid', { loadId, bidId });
            fetchLoads();
        } catch (err) {
            alert(err.response?.data?.message || 'Error accepting bid');
        }
    };

    return (
        <div className="flex bg-gray-50 min-h-screen pb-20 md:pb-0">
            <Sidebar role="SHIPPER" />
            <MobileNav />
            <div className="flex-1 md:ml-64 p-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">My Shipments</h1>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition shadow-lg"
                    >
                        {showForm ? 'Cancel' : '+ Post New Load'}
                    </button>
                </div>

                {showForm && (
                    <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-100 animate-fade-in">
                        <h2 className="text-xl font-semibold mb-4 text-gray-700">Create New Shipment</h2>
                        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <input placeholder="Origin" className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required value={formData.origin} onChange={e => setFormData({ ...formData, origin: e.target.value })} />
                            <input placeholder="Destination" className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required value={formData.destination} onChange={e => setFormData({ ...formData, destination: e.target.value })} />
                            <input placeholder="Cargo Type" className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required value={formData.cargoType} onChange={e => setFormData({ ...formData, cargoType: e.target.value })} />
                            <input type="number" placeholder="Max Price ($)" className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required value={formData.maxPrice} onChange={e => setFormData({ ...formData, maxPrice: e.target.value })} />
                            <button type="submit" className="md:col-span-4 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition">Post Load</button>
                        </form>
                    </div>
                )}

                <div className="grid gap-6">
                    {loads.map(load => (
                        <div key={load.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center space-x-3 mb-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase 
                      ${load.status === 'OPEN' ? 'bg-green-100 text-green-700' :
                                                load.status === 'BIDDING' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-blue-100 text-blue-700'}`}>
                                            {load.status}
                                        </span>
                                        <span className="text-gray-400 text-sm">#{load.id}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800">{load.origin} → {load.destination}</h3>
                                    <p className="text-gray-500 mt-1">{load.cargoType} • Max: ${load.maxPrice}</p>
                                </div>
                                {load.status === 'ASSIGNED' && (
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-500">Pickup OTP</p>
                                        <p className="text-2xl font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">{load.pickupOtp}</p>
                                    </div>
                                )}
                                {load.status === 'IN_TRANSIT' && (
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-500">Delivery OTP</p>
                                        <p className="text-2xl font-mono text-green-600 bg-green-50 px-2 py-1 rounded">{load.deliveryOtp}</p>
                                    </div>
                                )}
                            </div>

                            {/* Bids Section */}
                            {(load.status === 'OPEN' || load.status === 'BIDDING') && load.bids && load.bids.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <h4 className="text-sm font-bold text-gray-400 uppercase mb-3">Incoming Bids ({load.bids.length})</h4>
                                    <div className="space-y-3">
                                        {load.bids.map(bid => (
                                            <div key={bid.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                                <div>
                                                    <p className="font-bold text-gray-800">${bid.amount}</p>
                                                    <p className="text-xs text-gray-500">{bid.bidder?.email}</p>
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
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ShipperDashboard;
