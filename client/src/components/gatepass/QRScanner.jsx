import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const QRScanner = ({ onScanSuccess, onScanError }) => {
  const html5QrCodeRef = useRef(null);
  const isScanningRef = useRef(false);

  useEffect(() => {
    const qrRegionId = 'qr-reader';
    const html5QrCode = new Html5Qrcode(qrRegionId);
    html5QrCodeRef.current = html5QrCode;

    html5QrCode.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: 250 },
      (decodedText) => {
        // Guard against multiple frames detecting the same code before we can stop
        if (!isScanningRef.current) return;

        try {
          const parsed = JSON.parse(decodedText);
          isScanningRef.current = false;
          html5QrCode.stop()
            .then(() => html5QrCode.clear())
            .catch(() => {})
            .finally(() => onScanSuccess(parsed.gatePassId));
        } catch (err) {
          onScanError('Invalid QR code format');
        }
      },
      () => { /* ignore per-frame scan errors */ }
    )
      .then(() => {
        isScanningRef.current = true;
      })
      .catch((err) => {
        isScanningRef.current = false;
        onScanError('Could not start camera: ' + err);
      });

    return () => {
      const scanner = html5QrCodeRef.current;
      if (scanner && isScanningRef.current) {
        isScanningRef.current = false;
        scanner.stop()
          .then(() => scanner.clear())
          .catch(() => {});
      }
    };
  }, [onScanSuccess, onScanError]);

  return <div id="qr-reader" style={{ width: '300px' }} />;
};

export default QRScanner;