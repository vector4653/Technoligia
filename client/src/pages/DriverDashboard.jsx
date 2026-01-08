import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import axios from 'axios';
import { Camera, MapPin, CheckCircle } from 'lucide-react';

const DriverDashboard = () => {
    const [loads, setLoads] = useState([]);
    const [otpInputs, setOtpInputs] = useState({});

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

    const handleVerify = async (loadId) => {
        try {
            await axios.post(`http://localhost:5000/api/loads/${loadId}/verify-otp`, {
                otp: otpInputs[loadId]
            });
            fetchLoads();
            setOtpInputs(prev => ({ ...prev, [loadId]: '' }));
        } catch (err) {
            alert(err.response?.data?.message || 'Verification Failed');
        }
    };

    return (
        <div className="flex bg-gray-50 min-h-screen pb-20 md:pb-0">
            <Sidebar role="DRIVER" />
            <MobileNav />
            <div className="flex-1 md:ml-64 p-4 md:p-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">My Tasks</h1>

                <div className="space-y-4">
                    {loads.map(load => (
                        <div key={load.id} className="bg-white p-5 rounded-xl shadow-md border-l-4 border-blue-500">
                            <div className="flex justify-between items-center mb-4">
                                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">{load.status}</span>
                                <span className="text-gray-400 text-sm">#{load.id}</span>
                            </div>

                            <div className="flex items-center space-x-2 mb-2">
                                <MapPin size={18} className="text-gray-400" />
                                <span className="font-bold text-gray-800">{load.origin}</span>
                                <span className="text-gray-400">→</span>
                                <span className="font-bold text-gray-800">{load.destination}</span>
                            </div>

                            <p className="text-gray-500 text-sm mb-4 ml-6">{load.cargoType}</p>

                            {(load.status === 'ASSIGNED' || load.status === 'IN_TRANSIT') && (
                                <div className="bg-gray-50 p-4 rounded-lg mt-4">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                                        {load.status === 'ASSIGNED' ? 'Scan Pickup Code' : 'Scan Delivery Code'}
                                    </label>
                                    <div className="flex space-x-2">
                                        <input
                                            type="text"
                                            placeholder="Enter 6-digit OTP"
                                            className="flex-1 p-3 border rounded-lg text-lg tracking-widest text-center focus:ring-2 focus:ring-blue-500 outline-none"
                                            maxLength={6}
                                            value={otpInputs[load.id] || ''}
                                            onChange={(e) => setOtpInputs({ ...otpInputs, [load.id]: e.target.value })}
                                        />
                                        <button
                                            onClick={() => handleVerify(load.id)}
                                            className="bg-blue-600 text-white px-4 rounded-lg flex items-center justify-center hover:bg-blue-700"
                                        >
                                            <CheckCircle size={24} />
                                        </button>
                                        {/* Placeholder for camera scan button */}
                                        <button className="bg-gray-200 text-gray-600 px-4 rounded-lg flex items-center justify-center hover:bg-gray-300">
                                            <Camera size={24} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {loads.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-400">No active tasks</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DriverDashboard;
