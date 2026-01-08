import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        role: 'SHIPPER',
        fleetId: ''
    });
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        if (formData.role === 'DRIVER' && !formData.fleetId) {
            setError("Fleet ID is required for Drivers");
            setLoading(false);
            return;
        }

        try {
            // 1. Register User
            await axios.post('/api/auth/register', {
                email: formData.email,
                password: formData.password,
                role: formData.role,
                fleetId: formData.fleetId || null
            });

            // 2. Auto Login via Context
            const user = await login(formData.email, formData.password);

            // 3. Redirect based on role
            if (user.role === 'SHIPPER') navigate('/shipper');
            else if (user.role === 'FLEET') navigate('/fleet');
            else if (user.role === 'DRIVER') navigate('/driver');

        } catch (err) {
            setError(err.response?.data?.message || err.toString());
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-950 transition-colors duration-200">
            <div className="bg-white dark:bg-slate-900 p-8 rounded shadow-md w-full max-w-md transition-colors duration-200">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">Create Account</h2>
                {error && <p className="text-red-500 text-sm mb-4 bg-red-50 dark:bg-red-900/20 p-2 rounded">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Email</label>
                        <input
                            type="email"
                            name="email"
                            className="mt-1 block w-full p-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Role</label>
                        <select
                            name="role"
                            className="mt-1 block w-full p-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none"
                            value={formData.role}
                            onChange={handleChange}
                        >
                            <option value="SHIPPER">Shipper</option>
                            <option value="FLEET">Fleet Manager</option>
                            <option value="DRIVER">Driver</option>
                        </select>
                    </div>

                    {formData.role === 'DRIVER' && (
                        <div className="animate-fade-in">
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Fleet ID (Manager's User ID)</label>
                            <input
                                type="number"
                                name="fleetId"
                                placeholder="Enter your Fleet Manager's ID"
                                className="mt-1 block w-full p-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none"
                                value={formData.fleetId}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Password</label>
                            <input
                                type="password"
                                name="password"
                                className="mt-1 block w-full p-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Confirm</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                className="mt-1 block w-full p-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded font-bold transition-colors"
                    >
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600 dark:text-slate-400">
                        Already have an account?{' '}
                        <Link to="/login" className="text-blue-600 hover:underline font-medium">
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
