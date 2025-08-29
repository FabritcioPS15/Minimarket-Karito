import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { ProductForm } from './ProductForm';
import { BarcodeScanner } from './BarcodeScanner';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  AlertTriangle,
  Scan,
  Filter,
  Eye,
} from 'lucide-react';

export function ProductList() {
  const { state, dispatch } = useApp();
  const { products, currentUser } = state;
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'normal' | 'high'>('all');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const categories = [...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    
    const matchesStock = stockFilter === 'all' || 
      (stockFilter === 'low' && product.currentStock <= product.minStock) ||
      (stockFilter === 'normal' && product.currentStock > product.minStock && product.currentStock < product.maxStock) ||
      (stockFilter === 'high' && product.currentStock >= product.maxStock);

    return matchesSearch && matchesCategory && matchesStock;
  });

  const handleEdit = (product: Product) => {
    setEditProduct(product);
    setShowForm(true);
  };

  const handleDelete = (productId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      dispatch({ type: 'DELETE_PRODUCT', payload: productId });
    }
  };

  const isExpiringSoon = (expirationDate?: string) => {
    if (!expirationDate) return false;
    const expDate = new Date(expirationDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expDate <= thirtyDaysFromNow;
  };

  const getStockStatus = (product: Product) => {
    if (product.currentStock <= product.minStock) return 'low';
    if (product.currentStock >= product.maxStock) return 'high';
    return 'normal';
  };

  const getStockColor = (status: string) => {
    switch (status) {
      case 'low': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  if (showForm) {
    return (
      <ProductForm
        product={editProduct}
        onClose={() => {
          setShowForm(false);
          setEditProduct(null);
        }}
      />
    );
  }

  if (showScanner) {
    return (
      <BarcodeScanner
        onClose={() => setShowScanner(false)}
        onProductFound={(product) => {
          setEditProduct(product);
          setShowScanner(false);
          setShowForm(true);
        }}
      />
    );
  }

  const canEditProducts = currentUser?.role === 'admin' || currentUser?.role === 'supervisor';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Productos</h2>
          <p className="text-gray-600">Administra tu inventario de productos</p>
        </div>
        {canEditProducts && (
          <div className="flex space-x-3">
            <button
              onClick={() => setShowScanner(true)}
              className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Scan className="h-5 w-5" />
              <span>Escanear Código</span>
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Agregar Producto</span>
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar productos..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <select
            className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
          >
            <option value="all">Todo el stock</option>
            <option value="low">Stock bajo</option>
            <option value="normal">Stock normal</option>
            <option value="high">Sobre stock</option>
          </select>

          {/* Results Count */}
          <div className="flex items-center text-gray-600">
            <Filter className="h-4 w-4 mr-2" />
            <span>{filteredProducts.length} productos</span>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precios
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ganancia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vencimiento
                </th>
                {canEditProducts && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => {
                  const stockStatus = getStockStatus(product);
                  const expiringSoon = isExpiringSoon(product.expirationDate);
                  
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {product.imageUrl ? (
                            <div className="relative">
                              <img 
                                src={product.imageUrl} 
                                alt={product.name}
                                className="h-10 w-10 rounded-md object-cover mr-3"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                              <Package className="h-8 w-8 text-gray-400 mr-3 hidden" />
                            </div>
                          ) : (
                            <Package className="h-8 w-8 text-gray-400 mr-3" />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.brand}</div>
                            {product.imageUrl && (
                              <button
                                onClick={() => setImagePreview(product.imageUrl!)}
                                className="text-xs text-blue-600 hover:text-blue-800 mt-1 flex items-center"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Ver imagen
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.code}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockColor(stockStatus)}`}>
                            {product.currentStock}
                          </span>
                          {stockStatus === 'low' && (
                            <AlertTriangle className="h-4 w-4 text-red-500 ml-2" />
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          Min: {product.minStock} | Max: {product.maxStock}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          Costo: S/ {product.costPrice.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-600">
                          Venta: S/ {product.salePrice.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600">
                          {product.profitPercentage.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500">
                          S/ {(product.salePrice - product.costPrice).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.expirationDate ? (
                          <div className={`text-sm ${expiringSoon ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                            {new Date(product.expirationDate).toLocaleDateString('es-ES')}
                            {expiringSoon && (
                              <div className="flex items-center mt-1">
                                <AlertTriangle className="h-3 w-3 text-red-500 mr-1" />
                                <span className="text-xs">Por vencer</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Sin fecha</span>
                        )}
                      </td>
                      {canEditProducts && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={canEditProducts ? 8 : 7} className="px-6 py-12 text-center">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No se encontraron productos</p>
                    {canEditProducts && (
                      <button
                        onClick={() => setShowForm(true)}
                        className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Agregar primer producto
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de vista previa de imagen */}
      {imagePreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vista previa de la imagen</h3>
            <div className="flex justify-center mb-4">
              <img 
                src={imagePreview} 
                alt="Vista previa" 
                className="max-h-64 max-w-full object-contain rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xOCAxNUwxMiA5TDYgMTUiIHN0cm9rZT0iIzlDQTBCMyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+';
                }}
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setImagePreview(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}