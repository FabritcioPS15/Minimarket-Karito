import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BarChart,
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp,BarChart3, TrendingDown, DollarSign, ShoppingCart, Calendar } from 'lucide-react';

export function SalesReports() {
  const { state } = useApp();
  const { sales, products } = state;
  const [period, setPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 7));

  const salesData = useMemo(() => {
    const filteredSales = sales;
    // Most sold products
    const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();
    
    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        const name = item.name ?? item.productName ?? product?.name ?? 'Producto';
        const price = item.price ?? item.unitPrice ?? product?.salePrice ?? 0;
        const existing = productSales.get(item.productId) || { 
          name, // <-- usa ambos
          quantity: 0, 
          revenue: 0 
        };
        productSales.set(item.productId, {
          name, // <-- usa ambos
          quantity: existing.quantity + item.quantity,
          revenue: existing.revenue + (item.total ?? price * item.quantity),
        });
      });
    });

    const sortedProducts = Array.from(productSales.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.quantity - a.quantity);

    // Daily sales for chart
    const dailySales = new Map<string, number>();
    filteredSales.forEach(sale => {
      const date = new Date(sale.createdAt).toLocaleDateString('es-ES');
      dailySales.set(date, (dailySales.get(date) || 0) + sale.total);
    });

    const chartData = Array.from(dailySales.entries())
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30); // Last 30 days

    return {
      totalSales: filteredSales.length,
      totalRevenue: filteredSales.reduce((sum, sale) => sum + sale.total, 0),
      averageTicket: filteredSales.length > 0 ? filteredSales.reduce((sum, sale) => sum + sale.total, 0) / filteredSales.length : 0,
      topProducts: sortedProducts.slice(0, 5),
      leastSoldProducts: sortedProducts.slice(-5).reverse(),
      chartData,
      sales: filteredSales,
    };
  }, [sales, period, selectedDate, products]);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Período
            </label>
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
            >
              <option value="monthly">Mensual</option>
              <option value="quarterly">Trimestral</option>
              <option value="yearly">Anual</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha
            </label>
            <input
              type="month"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Ventas</p>
              <p className="text-2xl font-bold text-gray-900">{salesData.totalSales}</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
              <p className="text-2xl font-bold text-gray-900">S/ {salesData.totalRevenue.toFixed(2)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ticket Promedio</p>
              <p className="text-2xl font-bold text-gray-900">S/ {salesData.averageTicket.toFixed(2)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Productos Activos</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
            <Calendar className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ventas Diarias</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value: any) => [`S/ ${value.toFixed(2)}`, 'Total']} />
              <Bar dataKey="total" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Métodos de Pago</h3>
          {salesData.sales.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[...new Set(salesData.sales.map(s => s.paymentMethod))].map(method => ({
                    name: method,
                    value: salesData.sales.filter(s => s.paymentMethod === method).length,
                    amount: salesData.sales.filter(s => s.paymentMethod === method).reduce((sum, s) => sum + s.total, 0)
                  }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No hay datos de ventas</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
            Productos Más Vendidos
          </h3>
          <div className="space-y-3">
            {salesData.topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.quantity} unidades</p>
                    <p className="font-semibold text-gray-900">S/ {product.revenue.toFixed(2)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">S/ {product.revenue.toFixed(2)}</p>
                </div>
              </div>
            ))}
            {salesData.topProducts.length === 0 && (
              <p className="text-center text-gray-500 py-4">No hay datos de productos</p>
            )}
          </div>
        </div>

        {/* Least Sold Products */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingDown className="h-5 w-5 mr-2 text-red-600" />
            Productos Menos Vendidos
          </h3>
          <div className="space-y-3">
            {salesData.leastSoldProducts.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-red-100 text-red-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.quantity} unidades</p>
                    <p className="font-semibold text-gray-900">S/ {product.revenue.toFixed(2)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">S/ {product.revenue.toFixed(2)}</p>
                </div>
              </div>
            ))}
            {salesData.leastSoldProducts.length === 0 && (
              <p className="text-center text-gray-500 py-4">No hay datos de productos</p>
            )}
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalle de Ventas</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">#</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Cliente</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Fecha</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Total</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Pago</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Productos</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sales.map(sale => (
                <tr key={sale.id}>
                  <td>{sale.saleNumber}</td>
                  <td>{sale.customerName || 'Cliente general'}</td>
                  <td>{new Date(sale.createdAt).toLocaleString('es-PE')}</td>
                  <td>S/ {sale.total.toFixed(2)}</td>
                  <td>{sale.paymentMethod}</td>
                  <td>
                    <ul className="list-disc ml-4">
                      {sale.items.map((item: any) => (
                        <li key={item.id}>
                          {item.name ?? item.productName} x {item.quantity} - S/ {(item.price ?? item.unitPrice ?? 0).toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}