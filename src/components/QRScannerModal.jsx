import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, QrCode } from 'lucide-react';

export default function QRScannerModal({ isOpen, onClose, onScanSuccess }) {
  if (!isOpen) return null;

  const scannerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'qr-reader-container',
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        // e.g. https://trackwheel.app/token/G7X2P9 or #G7X2P9
        let token = decodedText;
        if (decodedText.includes('/token/')) {
          token = '#' + decodedText.split('/token/')[1];
        } else if (!token.startsWith('#')) {
          token = '#' + token;
        }
        scanner.clear();
        onScanSuccess(token);
      },
      (error) => {
        // console.warn(error);
      }
    );

    return () => {
      scanner.clear().catch(err => console.error('Error clearing QR scanner', err));
    };
  }, []);

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '450px' }}>
        <div className="modal-header">
          <h3>
            <QrCode size={22} style={{ color: '#06b6d4' }} />
            <span>Scan Digital Token QR Code</span>
          </h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <div id="qr-reader-container" style={{ width: '100%' }}></div>
          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8' }}>
            Hold the customer's phone QR code in front of the tablet camera.
          </p>
        </div>
      </div>
    </div>
  );
}
