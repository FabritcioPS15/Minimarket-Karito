import React, { forwardRef } from 'react';

export const PrintableInvoice = forwardRef(function PrintableInvoice(
  { sale, type }: { sale: any, type: 'boleta' | 'factura' },
  ref: React.Ref<HTMLDivElement>
) {
  if (!sale) return null;

  // Estilos base para ambos tipos de documento
  const baseStyle = {
    width: 320,
    fontFamily: "'Courier New', monospace",
    background: '#fff',
    color: '#222',
    padding: 16,
    borderRadius: 8,
    border: '1px solid #eee',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  };

  // Estilos específicos para boleta
  const boletaStyle = {
    borderTop: '4px solid #4CAF50',
    headerBg: '#E8F5E9',
    headerColor: '#2E7D32',
    accentColor: '#4CAF50'
  };

  // Estilos específicos para factura
  const facturaStyle = {
    borderTop: '4px solid #2196F3',
    headerBg: '#E3F2FD',
    headerColor: '#1565C0',
    accentColor: '#2196F3'
  };

  const docStyle = type === 'factura' ? facturaStyle : boletaStyle;

  return (
    <div
      ref={ref}
      style={baseStyle}
    >
      {/* Encabezado con diseño específico según tipo */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: 12, 
        padding: 12,
        backgroundColor: docStyle.headerBg,
        borderRadius: 6,
        border: `1px solid ${docStyle.accentColor}20`
      }}>
        <div style={{ fontSize: 28, marginBottom: 4 }}>
          {type === 'factura' ? '🧾' : '🛒'}
        </div>
        <div style={{ 
          fontWeight: 'bold', 
          fontSize: 20, 
          letterSpacing: 0.5,
          color: docStyle.headerColor
        }}>
          Minimarket Karito
        </div>
        <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
          RUC: 12345678901<br />
          Jr. Ejemplo 123, Lima<br />
          Tel: 958-077-827
        </div>
      </div>

      {/* Título del documento */}
      <div style={{ 
        textAlign: 'center', 
        fontWeight: 'bold', 
        fontSize: 16, 
        padding: '8px 0',
        color: docStyle.headerColor,
        borderTop: `2px dashed ${docStyle.accentColor}40`,
        borderBottom: `2px dashed ${docStyle.accentColor}40`,
        marginBottom: 12
      }}>
        {type === 'factura' ? 'FACTURA ELECTRÓNICA' : 'BOLETA ELECTRÓNICA'}
      </div>

      {/* Información de la venta */}
      <div style={{ 
        fontSize: 12, 
        marginBottom: 12,
        padding: 8,
        backgroundColor: '#f9f9f9',
        borderRadius: 4
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontWeight: 'bold' }}>Fecha:</span>
          <span>{new Date(sale.createdAt).toLocaleString('es-PE')}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontWeight: 'bold' }}>N°:</span>
          <span>{sale.saleNumber}</span>
        </div>
        <div style={{ marginBottom: 4 }}>
          <div style={{ fontWeight: 'bold', marginBottom: 2 }}>Cliente:</div>
          <div>{sale.customerName || 'Consumidor Final'}</div>
        </div>
        {sale.customerDocument && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 'bold' }}>Doc:</span>
            <span>{sale.customerDocument}</span>
          </div>
        )}
      </div>

      {/* Tabla de productos */}
      <table style={{ 
        width: '100%', 
        fontSize: 12, 
        borderCollapse: 'collapse',
        marginBottom: 12
      }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${docStyle.accentColor}40` }}>
            <th style={{ textAlign: 'left', padding: '4px 0' }}>Producto</th>
            <th style={{ textAlign: 'center', padding: '4px 0', width: '15%' }}>Cant</th>
            <th style={{ textAlign: 'right', padding: '4px 0', width: '20%' }}>Precio</th>
            <th style={{ textAlign: 'right', padding: '4px 0', width: '25%' }}>Subt</th>
          </tr>
        </thead>
        <tbody>
          {sale.items.map((item: any) => (
            <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '4px 0' }}>{item.name}</td>
              <td style={{ textAlign: 'center', padding: '4px 0' }}>{item.quantity}</td>
              <td style={{ textAlign: 'right', padding: '4px 0' }}>S/ {(item.price ?? 0).toFixed(2)}</td>
              <td style={{ textAlign: 'right', padding: '4px 0' }}>S/ {((item.price ?? 0) * (item.quantity ?? 0)).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totales */}
      <div style={{ 
        padding: '8px 0',
        borderTop: `2px dashed ${docStyle.accentColor}40`,
        borderBottom: `2px dashed ${docStyle.accentColor}40`,
        marginBottom: 12
      }}>
        <div style={{ 
          fontSize: 14, 
          textAlign: 'right', 
          fontWeight: 'bold',
          color: docStyle.headerColor
        }}>
          Total: S/ {(sale.total ?? 0).toFixed(2)}
        </div>
      </div>

      {/* Información de pago */}
      <div style={{ 
        fontSize: 12, 
        marginBottom: 12,
        padding: 8,
        backgroundColor: '#f9f9f9',
        borderRadius: 4
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Método de pago:</div>
        <div>{sale.paymentMethod}</div>
        {sale.operationNumber && (
          <div style={{ marginTop: 4 }}>
            <span style={{ fontWeight: 'bold' }}>N° Operación:</span> {sale.operationNumber}
          </div>
        )}
      </div>

      {/* Pie de página */}
      <div style={{ 
        textAlign: 'center', 
        fontSize: 11, 
        color: '#888',
        padding: 8,
        borderTop: `2px dashed ${docStyle.accentColor}40`
      }}>
        <div style={{ marginBottom: 4 }}>¡Gracias por su compra!</div>
        <div style={{ fontSize: 10, fontStyle: 'italic' }}>
          {type === 'factura' 
            ? 'Representación impresa de la factura electrónica' 
            : 'Comprobante de pago electrónico'}
        </div>
      </div>
    </div>
  );
});