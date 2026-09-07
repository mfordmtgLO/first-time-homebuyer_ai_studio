const fs = require('fs');
let c = fs.readFileSync('src/components/PropertyMapOverlay.tsx', 'utf8');
const target = `import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  Circle
  useMap
} from "@vis.gl/react-google-maps";`;
const repl = `import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  Circle,
  useMap
} from "@vis.gl/react-google-maps";`;
c = c.replace(target, repl);
fs.writeFileSync('src/components/PropertyMapOverlay.tsx', c);
