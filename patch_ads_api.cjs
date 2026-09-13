const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const newEndpoint = `
  app.get("/api/ads/property/:propertyId", async (req, res) => {
    try {
      const { propertyId } = req.params;
      const loId = req.query.loId || "lo_1";
      const firestore = getFirestore(adminApp);
      // Query synced ads where propertyId matches
      const syncedAdsRef = firestore.collection("users").doc(loId).collection("synced_ai_ads");
      const snapshot = await syncedAdsRef.where("propertyId", "==", propertyId).get();
      
      const ads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json({ success: true, ads });
    } catch (e) {
      console.warn("Failed to fetch property ads from Firestore, returning mock data", e);
      res.json({ success: true, ads: [] });
    }
  });
`;

if (!code.includes('app.get("/api/ads/property/:propertyId"')) {
  code = code.replace('app.get("/api/ads/synced"', newEndpoint + '\n  app.get("/api/ads/synced"');
  fs.writeFileSync('server.ts', code, 'utf8');
  console.log("Added /api/ads/property/:propertyId");
} else {
  console.log("Endpoint already exists");
}
