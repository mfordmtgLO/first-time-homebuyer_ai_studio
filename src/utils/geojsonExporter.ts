import { Property } from "../types";

/**
 * Constructs a standard GeoJSON FeatureCollection from property listings
 * for compatibility with Mapbox, ArcGIS, and advanced GIS tools.
 */
export function generateGeoJSON(properties: Property[]): string {
  const features = properties.map((p, idx) => {
    const lat = p.lat || (45.5152 + (idx * 0.01));
    const lng = p.lng || (-122.6784 + (idx * 0.01));

    return {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [lng, lat, 0]
      },
      properties: {
        id: p.id,
        title: p.title,
        price: p.price,
        address: p.address,
        city: p.city,
        state: p.state,
        zip: p.zip,
        monthlyPayment: p.monthlyPayment || Math.round(p.price * 0.0065),
        tourGrade: p.tourGrade || "B+",
        status: p.status,
        loanOfficer: "Mike Ford (fordmj@gmail.com / 555-0199)",
        agent: "Kanndice McLean",
        ctaNote: "For more information on low or no down payment mortgage products matched for high confidence eligible areas, call Mike Ford. To get a personalized home search profile, reach out to Kanndice McLean."
      }
    };
  });

  const geoJsonCollection = {
    type: "FeatureCollection",
    features: features
  };

  return JSON.stringify(geoJsonCollection, null, 2);
}
