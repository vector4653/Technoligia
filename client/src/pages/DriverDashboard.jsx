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
            const res = await axios.get('/api/loads');
            setLoads(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchLoads();
    }, []);

    const [verifying, setVerifying] = useState({});

    const handleVerify = async (loadId) => {
        const inputOtp = otpInputs[loadId];
        if (!inputOtp || !inputOtp.trim()) {
            return alert('Please enter the OTP');
        }

        setVerifying(prev => ({ ...prev, [loadId]: true }));
        try {
            await axios.post(`/api/loads/${loadId}/verify-otp`, {
                otp: inputOtp.trim()
            });
            await fetchLoads();
            setOtpInputs(prev => ({ ...prev, [loadId]: '' }));
            alert('Verification Successful!');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Verification Failed');
        } finally {
            setVerifying(prev => ({ ...prev, [loadId]: false }));
        }
    };

    return (
        <div className="flex bg-gray-50 dark:bg-slate-950 min-h-screen pb-20 md:pb-0 transition-colors duration-200">
            <Sidebar role="DRIVER" />
            <MobileNav />
            <div className="flex-1 md:ml-64 p-4 md:p-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-6">Driver Dashboard</h1>

                {/* Available Jobs Section */}
                <h2 className="text-xl font-bold text-gray-700 dark:text-slate-300 mb-4 mt-8">Available Jobs (Pool)</h2>
                <div className="space-y-4 mb-8">
                    {loads.filter(l => !l.assignedToDriverId && l.status === 'ASSIGNED').length === 0 ? (
                        <p className="text-gray-400 italic">No available jobs in the fleet pool.</p>
                    ) : (
                        loads.filter(l => !l.assignedToDriverId && l.status === 'ASSIGNED').map(load => (
                            <div key={load.id} className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 flex justify-between items-center transition-colors duration-200">
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <span className="font-bold text-gray-800 dark:text-white">{load.origin}</span>
                                        <span className="text-gray-400">→</span>
                                        <span className="font-bold text-gray-800 dark:text-white">{load.destination}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-slate-400">{load.cargoType}</p>
                                </div>
                                <button
                                    onClick={async () => {
                                        try {
                                            await axios.post(`/api/loads/${load.id}/accept-job`);
                                            fetchLoads();
                                            alert("Job Accepted!");
                                        } catch (err) {
                                            alert(err.response?.data?.message || 'Failed to accept job');
                                        }
                                    }}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition"
                                >
                                    Accept Job
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* My Tasks Section */}
                <h2 className="text-xl font-bold text-gray-700 dark:text-slate-300 mb-4">My Active Tasks</h2>
                <div className="space-y-4">
                    {loads.filter(l => l.assignedToDriverId).length === 0 ? (
                        <p className="text-gray-400 italic">No tasks assigned to you.</p>
                    ) : (
                        loads.filter(l => l.assignedToDriverId).map(load => (
                            <div key={load.id} className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-md border-l-4 border-blue-500 dark:border-blue-500 transition-colors duration-200">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold">{load.status}</span>
                                    <span className="text-gray-400 text-sm">#{load.id}</span>
                                </div>

                                <div className="flex items-center space-x-2 mb-2">
                                    <MapPin size={18} className="text-gray-400" />
                                    <span className="font-bold text-gray-800 dark:text-white">{load.origin}</span>
                                    <span className="text-gray-400">→</span>
                                    <span className="font-bold text-gray-800 dark:text-white">{load.destination}</span>
                                </div>

                                <p className="text-gray-500 dark:text-slate-400 text-sm mb-4 ml-6">{load.cargoType}</p>

                                {(load.status === 'ASSIGNED' || load.status === 'IN_TRANSIT') && (
                                    <div className={`p-4 rounded-lg mt-4 border ${load.status === 'ASSIGNED' ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30' : 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30'}`}>
                                        <div className="flex items-center justify-between mb-3">
                                            <label className={`block text-xs font-bold uppercase ${load.status === 'ASSIGNED' ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'}`}>
                                                {load.status === 'ASSIGNED' ? 'Step 1: Verify Pickup' : 'Step 2: Verify Delivery'}
                                            </label>
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${load.status === 'ASSIGNED' ? 'bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-200' : 'bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-200'}`}>
                                                {load.status === 'ASSIGNED' ? 'Waiting for Shipper OTP' : 'Arrived at Destination'}
                                            </span>
                                        </div>

                                        <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">
                                            {load.status === 'ASSIGNED'
                                                ? "Ask the Shipper for the pickup OTP to start the journey."
                                                : "Ask the Receiver for the delivery OTP to complete the job."}
                                        </p>

                                        <div className="flex space-x-2">
                                            <input
                                                type="text"
                                                placeholder={load.status === 'ASSIGNED' ? "Pickup OTP" : "Delivery OTP"}
                                                className={`flex-1 p-3 border dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white rounded-lg text-lg tracking-widest text-center outline-none focus:ring-2 ${load.status === 'ASSIGNED' ? 'focus:ring-blue-500' : 'focus:ring-green-500'}`}
                                                maxLength={6}
                                                value={otpInputs[load.id] || ''}
                                                onChange={(e) => setOtpInputs({ ...otpInputs, [load.id]: e.target.value })}
                                            />
                                            <button
                                                onClick={() => handleVerify(load.id)}
                                                disabled={verifying[load.id]}
                                                className={`text-white px-4 rounded-lg flex items-center justify-center disabled:opacity-50 transition ${load.status === 'ASSIGNED' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}
                                            >
                                                {verifying[load.id] ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" /> : <CheckCircle size={24} />}
                                            </button>
                                            <button className="bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-300 px-4 rounded-lg flex items-center justify-center hover:bg-gray-300 dark:hover:bg-slate-600">
                                                <Camera size={24} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default DriverDashboard;
