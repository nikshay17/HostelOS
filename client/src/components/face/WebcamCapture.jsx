import { useRef, useEffect, useState } from 'react';

const WebcamCapture = ({ onCapture, buttonLabel = 'Capture' }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setReady(true);
        }
      })
      .catch((err) => setError('Camera access denied or unavailable: ' + err.message));

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64Image = canvas.toDataURL('image/jpeg', 0.9);
    onCapture(base64Image);
  };

  return (
    <div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <video ref={videoRef} autoPlay playsInline width="320" height="240" style={{ border: '1px solid #ccc' }} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <br />
      <button onClick={handleCapture} disabled={!ready} style={{ marginTop: '0.5rem' }}>
        {buttonLabel}
      </button>
    </div>
  );
};

export default WebcamCapture;