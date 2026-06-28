import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const QRScanner = ({ onScanSuccess, onScanError }) => {
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    const qrRegionId = 'qr-reader';
    html5QrCodeRef.current = new Html5Qrcode(qrRegionId);

    html5QrCodeRef.current.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: 250 },
      (decodedText) => {
        try {
          const parsed = JSON.parse(decodedText);
          onScanSuccess(parsed.gatePassId);
        } catch (err) {
          onScanError('Invalid QR code format');
        }
      },
      (err) => { /* ignore per-frame scan errors */ }
    ).catch((err) => onScanError('Could not start camera: ' + err));

    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, [onScanSuccess, onScanError]);

  return <div id="qr-reader" ref={scannerRef} style={{ width: '300px' }} />;
};

export default QRScanner;