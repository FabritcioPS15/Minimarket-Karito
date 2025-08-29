import React, { forwardRef } from 'react';

export const PrintableInvoice = forwardRef(function PrintableInvoice(
  { sale, type }: { sale: any, type: 'boleta' | 'factura' },
  ref: React.Ref<HTMLDivElement>
) {
  if (!sale) return null;

  return (
    <div
      ref={ref}
      style={{
        width: 320,
        fontFamily: 'monospace',
        background: '#fff',
        color: '#222',
        padding: 16,
        borderRadius: 8,
        border: '1px solid #eee',
      }}
    >
      {/* Logo y nombre */}
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        {/* Si tienes un logo, reemplaza el emoji por <img src="logo.png" ... /> */}
        <div style={{ fontSize: 32 }}>🛒</div>
        <div style={{ fontWeight: 'bold', fontSize: 18, letterSpacing: 1 }}>
          Minimarket Karito
        </div>
        <div style={{ fontSize: 12, color: '#888' }}>
          RUC: 12345678901<br />
          Jr. Ejemplo 123, Lima<br />
          Tel: 999-999-999
        </div>
      </div>
      <hr style={{ margin: '8px 0' }} />
      <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 16 }}>
        {type === 'factura' ? 'FACTURA ELECTRÓNICA' : 'BOLETA ELECTRÓNICA'}
      </div>
      <div style={{ fontSize: 12, marginBottom: 8 }}>
        <b>Fecha:</b> {new Date(sale.createdAt).toLocaleString('es-PE')}
        <br />
        <b>N°:</b> {sale.saleNumber}
        <br />
        <b>Cliente:</b> {sale.customerName || 'Consumidor Final'}
        {sale.customerDocument && (
          <>
            <br />
            <b>Doc:</b> {sale.customerDocument}
          </>
        )}
      </div>
      <hr style={{ margin: '8px 0' }} />
      <table style={{ width: '100%', fontSize: 12 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>Producto</th>
            <th>Cant</th>
            <th>Precio</th>
            <th>Subt</th>
          </tr>
        </thead>
        <tbody>
          {sale.items.map((item: any) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td style={{ textAlign: 'center' }}>{item.quantity}</td>
              <td style={{ textAlign: 'right' }}>S/ {(item.price ?? 0).toFixed(2)}</td>
              <td style={{ textAlign: 'right' }}>S/ {((item.price ?? 0) * (item.quantity ?? 0)).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <hr style={{ margin: '8px 0' }} />
      <div style={{ fontSize: 13, textAlign: 'right', fontWeight: 'bold' }}>
        Total: S/ {(sale.total ?? 0).toFixed(2)}
      </div>
      <div style={{ fontSize: 12, textAlign: 'right', color: '#555' }}>
        IGV: S/ {(sale.tax ?? 0).toFixed(2)}
      </div>
      <div style={{ fontSize: 12, marginTop: 8 }}>
        <b>Pago:</b> {sale.paymentMethod}
        {sale.operationNumber && (
          <span> | Op: {sale.operationNumber}</span>
        )}
      </div>
      <hr style={{ margin: '8px 0' }} />
      <div style={{ textAlign: 'center', fontSize: 12, color: '#888' }}>
        ¡Gracias por su compra!<br />
        <span style={{ fontSize: 10 }}>Este comprobante no es válido para devolución de IGV.</span>
      </div>
    </div>
  );
});