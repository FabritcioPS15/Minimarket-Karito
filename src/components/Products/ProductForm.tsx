import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { ArrowLeft, Package, Save, Calculator, Eye } from 'lucide-react';

interface ProductFormProps {
  product?: Product | null;
  onClose: () => void;
}

export function ProductForm({ product, onClose }: ProductFormProps) {
  const { dispatch } = useApp();
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    category: '',
    brand: '',
    costPrice: '',
    salePrice: '',
    currentStock: '',
    minStock: '',
    maxStock: '',
    expirationDate: '',
    imageUrl: '', // Nuevo campo para la URL de la imagen
  });

  const [profitPercentage, setProfitPercentage] = useState(0);
  const [showImagePreview, setShowImagePreview] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        code: product.code,
        name: product.name,
        description: product.description,
        category: product.category,
        brand: product.brand,
        costPrice: product.costPrice.toString(),
        salePrice: product.salePrice.toString(),
        currentStock: product.currentStock.toString(),
        minStock: product.minStock.toString(),
        maxStock: product.maxStock.toString(),
        expirationDate: product.expirationDate || '',
        imageUrl: product.imageUrl || '', // Incluir la URL de la imagen si existe
      });
      setProfitPercentage(product.profitPercentage);
    }
  }, [product]);

  useEffect(() => {
    const cost = parseFloat(formData.costPrice) || 0;
    const sale = parseFloat(formData.salePrice) || 0;
    
    if (cost > 0 && sale > 0) {
      const profit = ((sale - cost) / cost) * 100;
      setProfitPercentage(profit);
    } else {
      setProfitPercentage(0);
    }
  }, [formData.costPrice, formData.salePrice]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const cost = parseFloat(formData.costPrice);
    const sale = parseFloat(formData.salePrice);
    
    if (cost >= sale) {
      alert('El precio de venta debe ser mayor al precio de costo');
      return;
    }

    const productData: Product = {
      id: product?.id || Date.now().toString(),
      code: formData.code,
      name: formData.name,
      description: formData.description,
      category: formData.category,
      brand: formData.brand,
      costPrice: cost,
      salePrice: sale,
      profitPercentage,
      currentStock: parseInt(formData.currentStock),
      minStock: parseInt(formData.minStock),
      maxStock: parseInt(formData.maxStock),
      expirationDate: formData.expirationDate || undefined,
      imageUrl: formData.imageUrl || undefined, // Incluir la URL de la imagen
      createdAt: product?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (product) {
      dispatch({ type: 'UPDATE_PRODUCT', payload: productData });
    } else {
      dispatch({ type: 'ADD_PRODUCT', payload: productData });
    }

    onClose();
  };

  const calculateSalePrice = () => {
    const cost = parseFloat(formData.costPrice) || 0;
    if (cost > 0 && profitPercentage > 0) {
      const salePrice = cost * (1 + profitPercentage / 100);
      setFormData({ ...formData, salePrice: salePrice.toFixed(2) });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onClose}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {product ? 'Editar Producto' : 'Agregar Producto'}
          </h2>
          <p className="text-gray-600">
            {product ? 'Modifica la información del producto' : 'Registra un nuevo producto en el inventario'}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Información Básica
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código del Producto *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Ej: PRD001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nombre del producto"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción del producto"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Ej: Bebidas"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marca *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Marca del producto"
                  />
                </div>
              </div>

              {/* Nuevo campo para URL de imagen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL de Imagen
                </label>
                <div className="flex space-x-2">
                  <input
                    type="url"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                  {formData.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setShowImagePreview(true)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      title="Vista previa de la imagen"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Ingresa la URL de una imagen para el producto (opcional)
                </p>
              </div>
            </div>

            {/* Pricing and Stock */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                Precios y Stock
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio de Costo *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">S/</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.costPrice}
                      onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio de Venta *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">S/</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.salePrice}
                      onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* Profit Calculation */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-800">Ganancia Calculada:</span>
                  <span className="text-lg font-bold text-green-800">{profitPercentage.toFixed(1)}%</span>
                </div>
                <div className="text-xs text-green-700 mt-1">
                  Ganancia por unidad: S/ {(parseFloat(formData.salePrice) - parseFloat(formData.costPrice) || 0).toFixed(2)}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Actual *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Mínimo *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Máximo *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.maxStock}
                    onChange={(e) => setFormData({ ...formData, maxStock: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Vencimiento
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.expirationDate}
                  onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>{product ? 'Actualizar' : 'Guardar'} Producto</span>
            </button>
          </div>
        </form>
      </div>

      {/* Modal de vista previa de imagen */}
      {showImagePreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vista previa de la imagen</h3>
            <div className="flex justify-center mb-4">
              <img 
                src={formData.imageUrl} 
                alt="Vista previa" 
                className="max-h-64 max-w-full object-contain rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xOCAxNUwxMiA5TDYgMTUiIHN0cm9rZT0iIzlDQTBCMyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+';
                }}
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowImagePreview(false)}
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