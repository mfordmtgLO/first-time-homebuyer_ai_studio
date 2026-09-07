export function hasAmenity(propertyId: string, amenityType: 'grocery' | 'transit' | 'parks'): boolean {
  const str = propertyId + amenityType;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 10 < 6;
}
