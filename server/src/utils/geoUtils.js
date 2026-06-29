// Returns distance in meters between two coordinates
const getDistanceInMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

const isWithinHostelRadius = (studentLat, studentLon) => {
  // Hardcoded hostel coordinates — move to .env or DB config later
  const HOSTEL_LAT = parseFloat(process.env.HOSTEL_LAT) || 28.7041;
  const HOSTEL_LON = parseFloat(process.env.HOSTEL_LON) || 77.1025;
  const ALLOWED_RADIUS_METERS = parseFloat(process.env.ALLOWED_RADIUS_METERS) || 200;

  const distance = getDistanceInMeters(studentLat, studentLon, HOSTEL_LAT, HOSTEL_LON);
  return { withinRadius: distance <= ALLOWED_RADIUS_METERS, distance };
};

module.exports = { getDistanceInMeters, isWithinHostelRadius };