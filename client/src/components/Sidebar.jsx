import { Home, PlusCircle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ role }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed hidden md:flex">
            <div className="p-6">
                <h1 className="text-2xl font-bold tracking-wider">FreightSync</h1>
                <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">{role} Portal</p>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                <div className="flex items-center space-x-3 p-3 bg-slate-800 rounded cursor-pointer hover:bg-slate-700 transition">
                    <Home size={20} />
                    <span>Dashboard</span>
                </div>
                {/* Add more links based on role if needed */}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full p-2 text-red-400 hover:text-red-300 transition"
                >
                    <LogOut size={20} />
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
