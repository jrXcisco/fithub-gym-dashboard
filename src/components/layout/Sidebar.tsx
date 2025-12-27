import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Calendar,
  UserCheck,
  Package,
  PhoneCall,
  Settings,
  LogOut,
  Dumbbell,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../stores/authStore';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dashboard/members', icon: Users, label: 'Members' },
  { 
    label: 'Team', 
    icon: UserCheck, 
    items: [
      { to: '/dashboard/team/manager', label: 'Manager' },
      { to: '/dashboard/trainers', label: 'Trainers' },
      { to: '/dashboard/team/helper', label: 'Helper' }
    ] 
  },
  { to: '/dashboard/follow-ups', icon: PhoneCall, label: 'Follow-ups' },
  { to: '/dashboard/events', icon: Calendar, label: 'Events' },
  { to: '/dashboard/resources', icon: Package, label: 'Resources' },
];

export function Sidebar() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const [isTeamOpen, setIsTeamOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg">GymPro</h1>
            <p className="text-xs text-gray-400">Management Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <div key={item.to || item.label}>
            {item.to ? (
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  )
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ) : (
              <div className="mb-1">
                <button 
                  onClick={() => setIsTeamOpen(!isTeamOpen)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {isTeamOpen ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                {isTeamOpen && (
                  <div className="ml-8 space-y-1">
                  {item.items?.map((subItem) => (
                    <NavLink
                      key={subItem.to}
                      to={subItem.to}
                      className={({ isActive }) =>
                        cn(
                          'block px-4 py-2 text-sm rounded-lg transition-colors',
                          isActive
                            ? 'bg-primary-600/20 text-primary-400'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        )
                      }
                    >
                      {subItem.label}
                    </NavLink>
                  ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800 space-y-1">
        <NavLink
          to="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </NavLink>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
