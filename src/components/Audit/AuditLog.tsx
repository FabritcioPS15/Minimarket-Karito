import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  History, 
  User, 
  Package, 
  ShoppingCart, 
  Search,
  Filter,
  Calendar
} from 'lucide-react';

interface AuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  username: string;
  action: string;
  entity: 'product' | 'sale' | 'user' | 'cash';
  entityId: string;
  details: string;
  oldValue?: any;
  newValue?: any;
}

export function AuditLog() {
  const { state } = useApp();
  const { currentUser } = state;
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  // In a real app, audit logs would come from the backend
  useEffect(() => {
    // Ejemplo usando fetch
    fetch('/api/audit-logs')
      .then(res => res.json())
      .then(data => setAuditEntries(data))
      .catch(() => setAuditEntries([]));
  }, []);

  const filteredEntries = auditEntries.filter(entry => {
    const matchesSearch = entry.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEntity = entityFilter === 'all' || entry.entity === entityFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const entryDate = new Date(entry.timestamp);
      const now = new Date();
      
      switch (dateFilter) {
        case 'today':
          matchesDate = entryDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = entryDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = entryDate >= monthAgo;
          break;
      }
    }
    
    return matchesSearch && matchesEntity && matchesDate;
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-800';
      case 'UPDATE': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEntityIcon = (entity: string) => {
    switch (entity) {
      case 'product': return Package;
      case 'sale': return ShoppingCart;
      case 'user': return User;
      case 'cash': return Calendar;
      default: return History;
    }
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No tienes permisos para acceder al registro de auditoría</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Registro de Auditoría</h2>
        <p className="text-gray-600">Historial completo de cambios en el sistema</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar en auditoría..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
          >
            <option value="all">Todas las entidades</option>
            <option value="product">Productos</option>
            <option value="sale">Ventas</option>
            <option value="user">Usuarios</option>
            <option value="cash">Caja</option>
          </select>

          <select
            className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="all">Todas las fechas</option>
            <option value="today">Hoy</option>
            <option value="week">Última semana</option>
            <option value="month">Último mes</option>
          </select>

          <div className="flex items-center text-gray-600">
            <Filter className="h-4 w-4 mr-2" />
            <span className="text-sm">{filteredEntries.length} registros</span>
          </div>
        </div>
      </div>

      {/* Audit Entries */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="divide-y divide-gray-200">
          {filteredEntries.map(entry => (
            <div key={entry.id} className="bg-white rounded-lg shadow p-4 mb-2 border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <span className="font-semibold">{entry.username}</span> realizó <span className="font-semibold">{entry.action}</span> en <span className="font-semibold">{entry.entity}</span>
                </div>
                <div className="text-xs text-gray-500">{new Date(entry.timestamp).toLocaleString('es-PE')}</div>
              </div>
              <div className="text-sm text-gray-700 mb-1">{entry.details}</div>
              {(entry.action === 'UPDATE' || entry.action === 'DELETE') && (
                <div className="text-xs text-gray-600">
                  <div>
                    <b>Antes:</b> {entry.oldValue ? JSON.stringify(entry.oldValue) : 'N/A'}
                  </div>
                  <div>
                    <b>Después:</b> {entry.newValue ? JSON.stringify(entry.newValue) : 'N/A'}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {filteredEntries.length === 0 && (
            <div className="text-center py-12">
              <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron registros de auditoría</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}