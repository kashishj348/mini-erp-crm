import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutGrid, Users, Boxes, FileText, LogOut } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const navItems = [
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/products', label: 'Products', icon: Boxes },
  { to: '/challans', label: 'Challans', icon: FileText }
];

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="w-full border-b bg-white p-4 lg:w-64 lg:border-b-0 lg:border-r">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-slate-900 p-2 text-white"><LayoutGrid size={18} /></div>
            <div>
              <p className="text-lg font-semibold">ERP CRM</p>
              <p className="text-sm text-slate-500">Operations Portal</p>
            </div>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname.startsWith(item.to);
              return (
                <Link key={item.to} to={item.to} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                  <Icon size={16} /> {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-8 rounded-lg border bg-slate-50 p-3 text-sm">
            <p className="font-medium">{user?.name || 'User'}</p>
            <p className="text-slate-500">{user?.role || 'Role'}</p>
          </div>
        </aside>
        <main className="flex-1 p-4 lg:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Operations Dashboard</h1>
              <p className="text-sm text-slate-500">Manage customers, stocks, and challans from one place.</p>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm font-medium text-slate-700">
              <LogOut size={16} /> Logout
            </button>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
