const address = "123 Main St, Bend OR";
const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
fetch(geocodeUrl, { headers: { "User-Agent": "AILoanOfficer/1.0" } })
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(console.error);
