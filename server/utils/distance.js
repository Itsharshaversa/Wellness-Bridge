/**
 * Calculates the great-circle distance between two points using the Haversine formula.
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
};

const toRad = (deg) => deg * (Math.PI / 180);

/**
 * Sorts hospitals by a composite score: availability + proximity
 * @param {Array} hospitals - Array with distance field added
 * @returns {Array} Sorted hospitals (best first)
 */
export const rankHospitals = (hospitals) => {
  return hospitals
    .map(h => {
      const availabilityScore = h.totalBeds > 0
        ? (h.availableBeds / h.totalBeds) * 100
        : 0;
      const distancePenalty = h.distance * 2; // weight distance more
      const compositeScore = availabilityScore - distancePenalty;
      return { ...h, availabilityScore: Math.round(availabilityScore), compositeScore };
    })
    .sort((a, b) => b.compositeScore - a.compositeScore);
};

/**
 * Estimates ETA based on distance (assuming avg ambulance speed of 40km/h in city)
 */
export const estimateETA = (distanceKm) => {
  const speedKmH = 40;
  const minutes = (distanceKm / speedKmH) * 60;
  return Math.max(1, Math.round(minutes));
};
