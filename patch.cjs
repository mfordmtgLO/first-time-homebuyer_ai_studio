const fs = require('fs');
const path = 'src/components/AgenticOrchestratorDiagnostics.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `  useEffect(() => {
    // Check main AI diagnostics
    fetch('/api/ai/diagnostics')
      .then(res => res.json())
      .then(data => {
        setStatus(data);
      })
      .catch(err => {
        console.error(err);
        setError("Failed to fetch diagnostics.");
      });

    // Check GeoSphere Math Engine
    fetch('/api/geosphere/classify', { 
       method: 'POST', 
       headers: { 'Content-Type': 'application/json' }, 
       body: JSON.stringify({ lat: 44.0, lng: -121.0, features: [] })
    })
    .then(res => res.json())
    .then(data => {
       if (data.success) setGeoSphereActive(true);
    })
    .catch(() => setGeoSphereActive(false))
    .finally(() => setLoading(false));
  }, []);`;

const replacement = `  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      fetch('/api/ai/diagnostics').then(res => {
        if (!res.ok) throw new Error("Failed to fetch ai");
        return res.json();
      }),
      fetch('/api/geosphere/classify', { 
         method: 'POST', 
         headers: { 'Content-Type': 'application/json' }, 
         body: JSON.stringify({ lat: 44.0, lng: -121.0, features: [] })
      }).then(res => res.json())
    ]).then(([aiResult, geoResult]) => {
      if (aiResult.status === 'fulfilled') {
        setStatus(aiResult.value);
      } else {
        setError("Failed to fetch diagnostics.");
      }
      
      if (geoResult.status === 'fulfilled') {
        setGeoSphereActive(geoResult.value.success || false);
      } else {
        setGeoSphereActive(false);
      }
    }).finally(() => {
      setLoading(false);
    });
  }, []);`;

if (content.includes(target)) {
  fs.writeFileSync(path, content.replace(target, replacement));
  console.log("Success");
} else {
  // try a more resilient replacement
  const targetRegex = /useEffect\(\(\) => \{[\s\S]*?finally\(\(\) => setLoading\(false\)\);\s*\}, \[\]\);/;
  if (targetRegex.test(content)) {
    fs.writeFileSync(path, content.replace(targetRegex, replacement));
    console.log("Regex Success");
  } else {
    console.log("Failed to find target");
  }
}
