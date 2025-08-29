import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Package, Lock, User } from 'lucide-react';

export function Login() {
  const { state, dispatch } = useApp();
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple authentication - in production, this would be more secure
    const user = state.users.find(u => 
      u.username === credentials.username && u.isActive
    );

    if (user) {
      // For demo purposes, any password works
      dispatch({ type: 'LOGIN', payload: user });
      setError('');
    } else {
      setError('Usuario no encontrado o inactivo');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="bg-blue-600 rounded-full p-3 inline-block mb-4">
              <Package className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Sistema de Inventario</h1>
            <p className="text-gray-600 mt-2">Accede a tu cuenta para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuario
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Ingresa tu usuario"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Ingresa tu contraseña"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all font-medium"
            >
              Iniciar Sesión
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-600 text-center mb-3">Usuarios de demostración:</p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between bg-gray-50 px-3 py-2 rounded">
                <span className="font-medium">admin</span>
                <span className="text-gray-600">Administrador</span>
              </div>
              <div className="flex justify-between bg-gray-50 px-3 py-2 rounded">
                <span className="font-medium">supervisor</span>
                <span className="text-gray-600">Supervisor</span>
              </div>
              <div className="flex justify-between bg-gray-50 px-3 py-2 rounded">
                <span className="font-medium">vendedor</span>
                <span className="text-gray-600">Cajero</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}