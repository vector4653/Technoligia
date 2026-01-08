import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = await login(email, password);
            if (user.role === 'SHIPPER') navigate('/shipper');
            else if (user.role === 'FLEET') navigate('/fleet');
            else if (user.role === 'DRIVER') navigate('/driver');
        } catch (err) {
            setError(err.toString());
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-950 transition-colors duration-200">
            <div className="bg-white dark:bg-slate-900 p-8 rounded shadow-md w-full max-w-md transition-colors duration-200">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">FreightSync Login</h2>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Email</label>
                        <input
                            type="email"
                            className="mt-1 block w-full p-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none transition-colors duration-200"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Password</label>
                        <input
                            type="password"
                            className="mt-1 block w-full p-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none transition-colors duration-200"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold"
                    >
                        Sign In
                    </button>
                </form>
                <div className="mt-4 text-xs text-gray-500 dark:text-slate-500 space-y-1">
                    <p>Demo Credentials:</p>
                    <p>Shipper: shipper@test.com / 1234</p>
                    <p>Fleet: fleet@test.com / 1234</p>
                    <p>Driver: driver@test.com / 1234</p>
                </div>

                <div className="mt-6 text-center border-t pt-4 border-gray-100 dark:border-slate-800">
                    <p className="text-sm text-gray-600 dark:text-slate-400">
                        Don't have an account?{' '}
                        <a href="/register" onClick={(e) => { e.preventDefault(); navigate('/register'); }} className="text-blue-600 hover:underline font-medium cursor-pointer">
                            Register here
                        </a>
                    </p>
                    <div className="mt-4">
                        <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="text-gray-500 hover:text-gray-700 dark:text-slate-500 dark:hover:text-slate-300 text-sm font-medium transition-colors">
                            ← Back to Home
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
