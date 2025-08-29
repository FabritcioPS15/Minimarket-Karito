import React from 'react';
import { useApp } from '../context/AppContext';
import { Package, ShoppingCart, BarChart3, Users, CreditCard, Bell, LogOut, Home, History, UserRound as UserRole } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  onViewChange: (view: string) => void;
}

export function Layout({ children, activeView, onViewChange }: LayoutProps) {
  const { state, dispatch } = useApp();
  const { currentUser, currentCashSession, alerts } = state;

  if (!currentUser) {
    return <div>{children}</div>;
  }

  const unreadAlerts = alerts.filter(alert => !alert.isRead).length;

  const handleLogout = () => {
    if (currentCashSession) {
      dispatch({ type: 'END_CASH_SESSION' });
    }
    dispatch({ type: 'LOGOUT' });
  };

  const navigationItems = [
    { icon: Home, label: 'Dashboard', id: 'dashboard', roles: ['admin', 'supervisor', 'cashier'] },
    { icon: Package, label: 'Productos', id: 'products', roles: ['admin', 'supervisor'] },
    { icon: ShoppingCart, label: 'Ventas', id: 'sales', roles: ['admin', 'supervisor', 'cashier'] },
    { icon: BarChart3, label: 'Reportes', id: 'reports', roles: ['admin', 'supervisor'] },
    { icon: Users, label: 'Usuarios', id: 'users', roles: ['admin'] },
    { icon: CreditCard, label: 'Caja', id: 'cash', roles: ['admin', 'supervisor', 'cashier'] },
    { icon: History, label: 'Auditoría', id: 'audit', roles: ['admin'] },
  ];

  const allowedItems = navigationItems.filter(item => 
    item.roles.includes(currentUser.role as UserRole)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Package className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Sistema de Inventario</h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* Cash Session Status */}
            {currentCashSession && (
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Caja Abierta
              </div>
            )}
            
            {/* Alerts */}
            <div className="relative">
              <Bell className="h-6 w-6 text-gray-600 cursor-pointer hover:text-gray-800" />
              {unreadAlerts > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadAlerts}
                </span>
              )}
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-2">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{currentUser.username}</p>
                <p className="text-xs text-gray-500 capitalize">
                  {currentUser.role === 'admin' ? 'Administrador' :
                   currentUser.role === 'supervisor' ? 'Supervisor' : 'Cajero'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-[calc(100vh-80px)]">
          <nav className="p-4 space-y-2">
            {allowedItems.map(({ icon: Icon, label, id }) => (
              <button
                key={id}
                onClick={() => onViewChange(id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  activeView === id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}