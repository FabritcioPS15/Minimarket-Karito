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
    // Simulate some audit entries
    const mockEntries: AuditEntry[] = [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        userId: '1',
        username: 'admin',
        action: 'CREATE',
        entity: 'product',
        entityId: 'PRD001',
        details: 'Nuevo producto agregado: Coca Cola 500ml',
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        userId: '2',
        username: 'vendedor',
        action: 'UPDATE',
        entity: 'product',
        entityId: 'PRD001',
        details: 'Stock actualizado de 50 a 45 unidades',
        oldValue: { stock: 50 },
        newValue: { stock: 45 },
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        userId: '3',
        username: 'supervisor',
        action: 'CREATE',
        entity: 'sale',
        entityId: 'V-001',
        details: 'Nueva venta registrada por S/ 25.50',
      },
    ];
    setAuditEntries(mockEntries);
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
          {filteredEntries.map(entry => {
            const EntityIcon = getEntityIcon(entry.entity);
            
            return (
              <div key={entry.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <EntityIcon className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(entry.action)}`}>
                          {entry.action}
                        </span>
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {entry.entity}
                        </span>
                        <span className="text-sm text-gray-500">#{entry.entityId}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(entry.timestamp).toLocaleString('es-ES')}
                      </div>
                    </div>
                    
                    <p className="mt-2 text-sm text-gray-700">{entry.details}</p>
                    
                    <div className="mt-2 flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{entry.username}</span>
                      </div>
                      
                      {entry.oldValue && entry.newValue && (
                        <div className="text-xs text-gray-500">
                          <span className="text-red-600">Anterior: {JSON.stringify(entry.oldValue)}</span>
                          <span className="mx-2">→</span>
                          <span className="text-green-600">Nuevo: {JSON.stringify(entry.newValue)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
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