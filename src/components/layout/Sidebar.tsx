import { BarChart3, FileText, FolderTree, LayoutDashboard, LogOut, MapPin } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/categories', icon: FolderTree, label: 'Categories' },
    { path: '/places', icon: MapPin, label: 'Places' },
    { path: '/reports', icon: FileText, label: 'Reports' },
    { path: '/stats', icon: BarChart3, label: 'Statistics' },
];

export function Sidebar() {
    const location = useLocation();
    const { signOut, admin } = useAuth();

    return (
        <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white flex flex-col">
            {/* Logo */}
            <div className="px-6 py-5 border-b border-gray-800">
                <h1 className="text-xl font-bold text-emerald-400">Nobti Admin</h1>
                <p className="text-xs text-gray-400 mt-1">نوبتي - لوحة التحكم</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${isActive
                                    ? 'bg-emerald-600 text-white'
                                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                }
              `}
                        >
                            <item.icon size={20} />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User Info & Logout */}
            <div className="px-4 py-4 border-t border-gray-800">
                <div className="text-sm text-gray-400 mb-3">
                    <p className="font-medium text-white">{admin?.role === 'superadmin' ? 'Super Admin' : 'Admin'}</p>
                </div>
                <button
                    onClick={signOut}
                    className="flex items-center gap-3 w-full px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                    <LogOut size={20} />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
