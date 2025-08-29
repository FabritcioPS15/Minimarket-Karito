import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sale } from '../../types';
import html2pdf from 'html2pdf.js';
import { 
  Receipt, 
  Search, 
  Eye, 
  Download,
  DollarSign,
  Printer // Agrega el ícono de impresora
} from 'lucide-react';
import { PrintableInvoice } from './PrintableInvoice'; // Importa el comprobante

export function SalesList() {
  const { state } = useApp();
  const { sales } = state;
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [invoiceType, setInvoiceType] = useState<'boleta' | 'factura'>('boleta');
  const printRef = React.useRef<HTMLDivElement>(null);

  const getFilteredSales = () => {
    let filtered = sales;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(sale =>
        sale.saleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.customerDocument?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const startDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(sale => 
        new Date(sale.createdAt) >= startDate
      );
    }

    // Payment filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(sale => sale.paymentMethod === paymentFilter);
    }

    return filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const filteredSales = getFilteredSales();
  const totalAmount = filteredSales.reduce((sum, sale) => sum + sale.total, 0);

  const handlePrintClick = (sale: Sale) => {
    setSelectedSale(sale);
    setPrintModalOpen(true);
  };

  const handleViewClick = (sale: Sale) => {
    setSelectedSale(sale);
    setViewModalOpen(true);
  };

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

  const handleDownloadClick = (sale: Sale, type: 'boleta' | 'factura' = 'boleta') => {
    setSelectedSale(sale);
    setInvoiceType(type);

    // Espera a que el comprobante se renderice
    setTimeout(() => {
      if (printRef.current) {
        html2pdf()
          .set({ filename: `${type}-${sale.saleNumber}.pdf` })
          .from(printRef.current)
          .save();
      }
    }, 300);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar ventas..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

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

          <select
            className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            <option value="all">Todos los pagos</option>
            <option value="cash">Efectivo</option>
            <option value="card">Tarjeta</option>
            <option value="transfer">Transferencia</option>
            <option value="yape">Yape</option>
            <option value="plin">Plin</option>
            <option value="other">Otro</option>
          </select>

          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium">Total: S/ {totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  N° Venta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pago
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSales.map(sale => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{sale.saleNumber}</div>
                    <div className="text-xs text-gray-500">{sale.items.length} items</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {sale.customerName || 'Cliente general'}
                    </div>
                    {sale.customerDocument && (
                      <div className="text-xs text-gray-500">{sale.customerDocument}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(sale.createdAt).toLocaleDateString('es-ES')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(sale.createdAt).toLocaleTimeString('es-ES')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">S/ {sale.total.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">
                      IGV: S/ {sale.tax.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 capitalize">{sale.paymentMethod}</div>
                    {sale.operationNumber && (
                      <div className="text-xs text-gray-500">Op: {sale.operationNumber}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Completada
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                        onClick={() => handleViewClick(sale)}
                        title="Ver venta"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {/* Botón de descargar */}
                      <button
                        className="text-green-600 hover:text-green-800 p-1 hover:bg-green-50 rounded"
                        onClick={() => handleDownloadClick(sale)}
                        title="Descargar comprobante"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        className="text-gray-600 hover:text-gray-800 p-1 hover:bg-gray-50 rounded"
                        onClick={() => handlePrintClick(sale)}
                        title="Imprimir comprobante"
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSales.length === 0 && (
          <div className="text-center py-12">
            <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron ventas</p>
          </div>
        )}
      </div>

      {/* Print Modal */}
      {printModalOpen && selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Imprimir Comprobante</h3>
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium">Tipo:</label>
              <select
                value={invoiceType}
                onChange={e => setInvoiceType(e.target.value as 'boleta' | 'factura')}
                className="w-full border rounded px-2 py-1"
              >
                <option value="boleta">Boleta</option>
                <option value="factura">Factura</option>
              </select>
            </div>
            <div className="border p-2 mb-4 bg-gray-50">
              <div ref={printRef}>
                <PrintableInvoice sale={selectedSale} type={invoiceType} />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setPrintModalOpen(false)}>Cerrar</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handlePrint}>Imprimir</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de vista */}
      {viewModalOpen && selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Detalle de Venta</h3>
            <div className="mb-4">
              <div><b>N° Venta:</b> {selectedSale.saleNumber}</div>
              <div><b>Cliente:</b> {selectedSale.customerName || 'Cliente general'}</div>
              <div><b>Fecha:</b> {new Date(selectedSale.createdAt).toLocaleString('es-ES')}</div>
              <div><b>Total:</b> S/ {selectedSale.total.toFixed(2)}</div>
              <div><b>Pago:</b> {selectedSale.paymentMethod}</div>
              <div className="mt-2">
                <b>Productos:</b>
                <ul className="list-disc ml-4">
                  {selectedSale.items.map((item: any) => (
                    <li key={item.id}>
                      {item.name} x {item.quantity} - S/ {(item.price * item.quantity).toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex justify-end">
              <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setViewModalOpen(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Comprobante invisible para descargar */}
      <div style={{ display: 'none' }}>
        {selectedSale && (
          <div ref={printRef}>
            <PrintableInvoice sale={selectedSale} type={invoiceType} />
          </div>
        )}
      </div>
    </div>
  );
}