import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import axios from 'axios';

const FleetDashboard = () => {
    const [loads, setLoads] = useState([]);
    const [bidAmounts, setBidAmounts] = useState({});

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
        // Poll for updates every 5 seconds for real-time feel
        const interval = setInterval(fetchLoads, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleBid = async (loadId) => {
        try {
            const amount = bidAmounts[loadId];
            if (!amount) return;
            await axios.post(`http://localhost:5000/api/loads/${loadId}/bids`, { amount: Number(amount) });
            fetchLoads();
            setBidAmounts(prev => ({ ...prev, [loadId]: '' }));
        } catch (err) {
            alert(err.response?.data?.message || 'Bid Failed');
        }
    };

    return (
        <div className="flex bg-gray-50 min-h-screen pb-20 md:pb-0">
            <Sidebar role="FLEET" />
            <MobileNav />
            <div className="flex-1 md:ml-64 p-4 md:p-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Load Marketplace</h1>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {loads.map(load => (
                        <div key={load.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-full">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${load.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {load.status}
                                    </span>
                                    <span className="font-mono text-sm text-gray-400">#{load.id}</span>
                                </div>
                                <h3 className="tex-lg font-bold text-gray-800">{load.origin}</h3>
                                <p className="text-gray-400 text-sm mb-2">to</p>
                                <h3 className="text-lg font-bold text-gray-800 mb-4">{load.destination}</h3>

                                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                                    <p className="text-sm text-gray-500">Cargo: <span className="font-medium text-gray-800">{load.cargoType}</span></p>
                                    <p className="text-sm text-gray-500">Max Price: <span className="font-medium text-green-600">${load.maxPrice}</span></p>
                                </div>
                            </div>

                            {(load.status === 'OPEN' || load.status === 'BIDDING') ? (
                                <div className="flex space-x-2 mt-2">
                                    <input
                                        type="number"
                                        placeholder="Bid Amount"
                                        className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
                                        value={bidAmounts[load.id] || ''}
                                        onChange={(e) => setBidAmounts({ ...bidAmounts, [load.id]: e.target.value })}
                                    />
                                    <button
                                        onClick={() => handleBid(load.id)}
                                        className="bg-black text-white px-4 py-2 rounded font-bold hover:bg-gray-800"
                                    >
                                        Bid
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-2 text-center p-2 bg-gray-100 rounded text-gray-500 text-sm font-medium">
                                    {load.status === 'ASSIGNED' ? 'Assigned (Check My Loads)' : 'Closed'}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FleetDashboard;
