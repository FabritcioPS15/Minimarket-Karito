import React, { useEffect, useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, Sale, SaleItem, PaymentMethod } from '../../types';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Scan, 
  CreditCard,
  Smartphone,
  DollarSign,
  Receipt,
  Calculator
} from 'lucide-react';
import { PrintableInvoice } from './PrintableInvoice';

export function InvoiceModal({ open, onClose, onPrint, sale, type, setType }: any) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (printRef.current) {
      const printContents = printRef.current.innerHTML;
      const win = window.open('', '', 'width=400,height=600');
      win?.document.write(`<html><head><title>Imprimir</title></head><body>${printContents}</body></html>`);
      win?.document.close();
      win?.focus();
      win?.print();
      win?.close();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h3 className="text-lg font-semibold mb-4">Generar Comprobante</h3>
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">Tipo:</label>
          <select value={type} onChange={e => setType(e.target.value)} className="w-full border rounded px-2 py-1">
            <option value="boleta">Boleta</option>
            <option value="factura">Factura</option>
          </select>
        </div>
        <div className="border p-2 mb-4 bg-gray-50">
          <PrintableInvoice ref={printRef} sale={sale} type={type} />
        </div>
        <div className="flex justify-end space-x-2">
          <button className="px-4 py-2 bg-gray-200 rounded" onClick={onClose}>Cancelar</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handlePrint}>Imprimir</button>
        </div>
      </div>
    </div>
  );
}

export function PointOfSale() {
  const { state, dispatch } = useApp();
  const { products, currentUser, currentCashSession } = state;
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [operationNumber, setOperationNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerDocument, setCustomerDocument] = useState('');
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [invoiceType, setInvoiceType] = useState<'boleta' | 'factura'>('boleta');
  const [currentSale, setCurrentSale] = useState<any>(null);

  useEffect(() => {
    const handler = () => setInvoiceOpen(true);
    window.addEventListener('openInvoiceModal', handler);
    return () => window.removeEventListener('openInvoiceModal', handler);
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const subtotal = cart.reduce((sum, item) => sum + ((item.price ?? 0) * (item.quantity ?? 0)), 0);
  const tax = subtotal * 0.18; // 18% IGV
  const total = subtotal + tax;

  const addToCart = (product: Product) => {
    // Verifica si ya está en el carrito
    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      updateQuantity(existing.id, existing.quantity + 1);
      return;
    }
    setCart([
      ...cart,
      {
        id: Date.now().toString(),
        productId: product.id,
        name: product.name, // <-- nombre del producto
        price: product.salePrice, // <-- precio de venta
        quantity: 1,
        total: product.salePrice,
      }
    ]);
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    const item = cart.find(i => i.id === itemId);
    const product = products.find(p => p.id === item?.productId);
    
    if (product && newQuantity > product.currentStock) {
      alert('No hay suficiente stock disponible');
      return;
    }

    setCart(cart.map(item => 
      item.id === itemId 
        ? { ...item, quantity: newQuantity, total: item.unitPrice * newQuantity }
        : item
    ));
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName('');
    setCustomerDocument('');
    setOperationNumber('');
  };

  const processSale = () => {
    if (!currentCashSession && currentUser?.role !== 'admin') {
      alert('Debe abrir una sesión de caja para realizar ventas');
      return;
    }

    if (cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    if (paymentMethod !== 'cash' && !operationNumber.trim()) {
      alert('Debe ingresar el número de operación para pagos electrónicos');
      return;
    }

    const saleNumber = `V-${Date.now()}`;

    // Reconstruye los items del carrito con nombre y precio
    const saleItems = cart.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        ...item,
        name: item.name ?? product?.name ?? '',
        price: item.price ?? product?.salePrice ?? 0,
        total: (item.price ?? product?.salePrice ?? 0) * (item.quantity ?? 1),
      };
    });

    const subtotal = saleItems.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.18;
    const total = subtotal + tax;

    const sale: Sale = {
      id: Date.now().toString(),
      saleNumber,
      items: saleItems,
      subtotal,
      tax,
      total,
      paymentMethod,
      operationNumber: operationNumber || undefined,
      customerName: customerName || undefined,
      customerDocument: customerDocument || undefined,
      status: 'completed',
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.id || '',
    };

    // Actualiza stock y kardex
    cart.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        const updatedProduct = {
          ...product,
          currentStock: product.currentStock - item.quantity,
          updatedAt: new Date().toISOString(),
        };
        dispatch({ type: 'UPDATE_PRODUCT', payload: updatedProduct });

        dispatch({
          type: 'ADD_KARDEX_ENTRY',
          payload: {
            id: Date.now().toString() + Math.random(),
            productId: product.id,
            type: 'exit',
            quantity: item.quantity,
            unitCost: product.costPrice,
            totalCost: product.costPrice * item.quantity,
            reason: 'Venta',
            reference: saleNumber,
            createdAt: new Date().toISOString(),
            createdBy: currentUser?.id || '',
          },
        });
      }
    });

    dispatch({ type: 'ADD_SALE', payload: sale });

    setCurrentSale(sale);
    setInvoiceOpen(true);
  };


  const paymentMethods = [
    { id: 'cash', label: 'Efectivo', icon: DollarSign },
    { id: 'card', label: 'Tarjeta', icon: CreditCard },
    { id: 'transfer', label: 'Transferencia', icon: Receipt },
    { id: 'yape', label: 'Yape', icon: Smartphone },
    { id: 'plin', label: 'Plin', icon: Smartphone },
    { id: 'other', label: 'Otro', icon: Calculator },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Product Search */}
      <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Productos</h3>
          <div className="mt-2 relative">
            <input
              type="text"
              placeholder="Buscar productos por nombre o código..."
              className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Scan className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
        
        <div className="p-4 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredProducts.slice(0, 20).map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="text-left p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                disabled={product.currentStock <= 0}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">{product.name}</h4>
                    <p className="text-xs text-gray-500">{product.code}</p>
                    <p className="text-sm font-semibold text-blue-600">S/ {product.salePrice.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      product.currentStock > product.minStock 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.currentStock}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Shopping Cart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Carrito ({cart.length})
          </h3>
        </div>

        <div className="p-4">
          {/* Cart Items */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
{cart.map(item => (
  <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
    <div className="flex-1">
      <h4 className="text-sm font-medium text-gray-900">{item.name}</h4> {/* <-- aquí */}
      <p className="text-xs text-gray-500">S/ {(item.price ?? 0).toFixed(2)} c/u</p> {/* <-- aquí */}
    </div>
    <div className="flex items-center space-x-2">
      <button
        onClick={() => updateQuantity(item.id, item.quantity - 1)}
        className="p-1 text-gray-500 hover:text-red-600"
      >
        <Minus className="h-3 w-3" />
      </button>
      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
      <button
        onClick={() => updateQuantity(item.id, item.quantity + 1)}
        className="p-1 text-gray-500 hover:text-blue-600"
      >
        <Plus className="h-3 w-3" />
      </button>
      <button
        onClick={() => removeFromCart(item.id)}
        className="p-1 text-gray-500 hover:text-red-600 ml-2"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  </div>
))}
            
            {cart.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Carrito vacío</p>
              </div>
            )}
          </div>

          {/* Totals */}
          {cart.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>S/ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>IGV (18%):</span>
                <span>S/ {tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>S/ {total.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Customer Info */}
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Cliente (Opcional)
              </label>
              <input
                type="text"
                className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nombre del cliente"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Documento (Opcional)
              </label>
              <input
                type="text"
                className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                value={customerDocument}
                onChange={(e) => setCustomerDocument(e.target.value)}
                placeholder="DNI/RUC"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Método de Pago
            </label>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map(method => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                  className={`flex items-center justify-center space-x-1 p-2 text-xs rounded-lg border transition-colors ${
                    paymentMethod === method.id
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <method.icon className="h-3 w-3" />
                  <span>{method.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Operation Number for Electronic Payments */}
          {paymentMethod !== 'cash' && (
            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Número de Operación *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                value={operationNumber}
                onChange={(e) => setOperationNumber(e.target.value)}
                placeholder="Número de operación"
              />
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 space-y-2">
            <button
              onClick={processSale}
              disabled={cart.length === 0}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Receipt className="h-4 w-4" />
              <span>Procesar Venta</span>
            </button>
            
            <button
              onClick={clearCart}
              disabled={cart.length === 0}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Limpiar Carrito
            </button>
          </div>
        </div>
      </div>

      <InvoiceModal
        open={invoiceOpen}
        onClose={() => setInvoiceOpen(false)}
        sale={currentSale}
        type={invoiceType}
        setType={setInvoiceType}
      />
    </div>
  );
}