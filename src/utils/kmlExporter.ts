import { Property } from "../types";

/**
 * Constructs a standard KML string structure from property listings
 * for Google My Maps compatibility.
 */
export function generateKML(properties: Property[]): string {
  let kmlContent = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  kmlContent += `<kml xmlns="http://www.opengis.net/kml/2.2">\n`;
  kmlContent += `  <Document>\n`;
  kmlContent += `    <name>First-Time Homebuyer Curated Property Map</name>\n`;
  kmlContent += `    <description>Curated properties with USDA/LMI eligibility, monthly payments, and co-branded loan officer contacts (Mike Ford &amp; Kanndice McLean).</description>\n`;

  properties.forEach((p, idx) => {
    const lat = p.lat || (45.5152 + (idx * 0.01));
    const lng = p.lng || (-122.6784 + (idx * 0.01));

    kmlContent += `    <Placemark>\n`;
    kmlContent += `      <name><![CDATA[${p.title} - $${p.price.toLocaleString()}]]></name>\n`;
    kmlContent += `      <description><![CDATA[\n`;
    kmlContent += `        <b>Address:</b> ${p.address}, ${p.city}, ${p.state} ${p.zip}<br/>\n`;
    kmlContent += `        <b>Price:</b> $${p.price.toLocaleString()}<br/>\n`;
    kmlContent += `        <b>Est. Monthly P&I:</b> $${p.monthlyPayment || Math.round(p.price * 0.0065)}/mo<br/>\n`;
    kmlContent += `        <b>Tour Grade:</b> ${p.tourGrade || 'B+'}<br/>\n`;
    kmlContent += `        <hr/>\n`;
    kmlContent += `        <b>Co-Branded Contact:</b><br/>\n`;
    kmlContent += `        • Loan Officer: Mike Ford (fordmj@gmail.com / 555-0199)<br/>\n`;
    kmlContent += `        • Real Estate Agent: Kanndice McLean<br/>\n`;
    kmlContent += `        <br/>\n`;
    kmlContent += `        <i>For more information on low or no down payment mortgage products matched for high confidence eligible areas, call Mike Ford. To get a personalized home search profile, reach out to Kanndice McLean.</i>\n`;
    kmlContent += `      ]]></description>\n`;
    kmlContent += `      <Point>\n`;
    kmlContent += `        <coordinates>${lng},${lat},0</coordinates>\n`;
    kmlContent += `      </Point>\n`;
    kmlContent += `    </Placemark>\n`;
  });

  kmlContent += `  </Document>\n`;
  kmlContent += `</kml>`;

  return kmlContent;
}
