const LocationMap = ({ latitude, longitude }) => {
  if (!latitude || !longitude) return <p>No location data</p>;

  const bbox = `${longitude - 0.002}%2C${latitude - 0.002}%2C${longitude + 0.002}%2C${latitude + 0.002}`;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude}%2C${longitude}`;

  return (
    <iframe
      title="Check-in location"
      width="300"
      height="200"
      style={{ border: '1px solid #ccc' }}
      src={mapUrl}
    />
  );
};

export default LocationMap;