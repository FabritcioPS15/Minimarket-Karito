import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { ArrowLeft, Scan, Search } from 'lucide-react';

interface BarcodeScannerProps {
  onClose: () => void;
  onProductFound: (product: Product) => void;
}

export function BarcodeScanner({ onClose, onProductFound }: BarcodeScannerProps) {
  const { state } = useApp();
  const { products } = state;
  const [manualCode, setManualCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, []);

  const startScanner = () => {
    setScanning(true);
    
    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      { 
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false
    );

    scannerRef.current.render(
      (decodedText) => {
        handleCodeFound(decodedText);
      },
      (error) => {
        // Handle scan error - usually just noise
      }
    );
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const handleCodeFound = (code: string) => {
    const product = products.find(p => p.code === code);
    if (product) {
      stopScanner();
      onProductFound(product);
    } else {
      // Product not found, could create new product with this code
      alert(`Producto con código ${code} no encontrado. Puedes crear uno nuevo con este código.`);
    }
  };

  const handleManualSearch = () => {
    if (manualCode.trim()) {
      handleCodeFound(manualCode.trim());
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
          <h2 className="text-2xl font-bold text-gray-900">Escanear Código de Barras</h2>
          <p className="text-gray-600">Usa la cámara o ingresa el código manualmente</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Camera Scanner */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Scan className="h-5 w-5 mr-2" />
            Escanear con Cámara
          </h3>
          
          {!scanning ? (
            <div className="text-center py-12">
              <div className="bg-blue-50 rounded-full p-4 inline-block mb-4">
                <Scan className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-gray-600 mb-4">Haz clic para activar la cámara y escanear</p>
              <button
                onClick={startScanner}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Activar Cámara
              </button>
            </div>
          ) : (
            <div>
              <div id="qr-reader" className="w-full"></div>
              <div className="mt-4 text-center">
                <button
                  onClick={stopScanner}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Detener Escáner
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Manual Entry */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Búsqueda Manual
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código del Producto
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Ingresa el código manualmente"
                onKeyPress={(e) => e.key === 'Enter' && handleManualSearch()}
              />
            </div>
            
            <button
              onClick={handleManualSearch}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Search className="h-4 w-4" />
              <span>Buscar Producto</span>
            </button>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                <strong>Productos registrados:</strong> {products.length}
              </p>
              <div className="mt-2 max-h-32 overflow-y-auto">
                {products.slice(0, 5).map(product => (
                  <div key={product.id} className="text-xs text-gray-500 py-1">
                    {product.code} - {product.name}
                  </div>
                ))}
                {products.length > 5 && (
                  <div className="text-xs text-gray-400">Y {products.length - 5} más...</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}