/**
 * Calculate distance between two coordinates using Haversine formula
 */
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const radLat1 = lat1 * (Math.PI / 180);
  const radLon1 = lon1 * (Math.PI / 180);
  const radLat2 = lat2 * (Math.PI / 180);
  const radLon2 = lon2 * (Math.PI / 180);

  const R = 6371; // Earth radius in KM

  const dLat = radLat2 - radLat1;
  const dLon = radLon2 - radLon1;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(radLat1) *
      Math.cos(radLat2) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Format distance to readable string
 */
function formatDistance(distance) {
  if (distance < 1) {
    return `${(distance * 1000).toFixed(0)} meters`;
  } else {
    return `${distance.toFixed(1)} km`;
  }
}

// ✅ EXPORT (CommonJS)
module.exports = {
  getDistanceFromLatLonInKm,
  formatDistance
};
