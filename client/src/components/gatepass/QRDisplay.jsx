const QRDisplay = ({ qrCode, label = 'Scan at the gate' }) => {
  if (!qrCode) return null;
  return (
    <div style={{ textAlign: 'center' }}>
      <p>{label}</p>
      <img src={qrCode} alt="QR Code" width="180" />
    </div>
  );
};

export default QRDisplay;