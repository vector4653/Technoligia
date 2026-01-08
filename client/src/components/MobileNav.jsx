import { Home, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const MobileNav = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="md:hidden fixed bottom-0 w-full bg-slate-900 text-white flex justify-around p-4 z-50">
            <div className="flex flex-col items-center cursor-pointer" onClick={() => navigate('/')}>
                <Home size={24} />
                <span className="text-xs mt-1">Home</span>
            </div>
            <div className="flex flex-col items-center cursor-pointer text-red-400" onClick={() => { logout(); navigate('/login'); }}>
                <LogOut size={24} />
                <span className="text-xs mt-1">Exit</span>
            </div>
        </div>
    );
};

export default MobileNav;
