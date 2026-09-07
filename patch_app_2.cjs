const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

const eventLogic = `  const [showTelemetryModal, setShowTelemetryModal] = useState(false);

  useEffect(() => {
    const handleOpenTelemetry = () => setShowTelemetryModal(true);
    window.addEventListener('open-telemetry', handleOpenTelemetry);
    return () => window.removeEventListener('open-telemetry', handleOpenTelemetry);
  }, []);`;

c = c.replace(
  'const [showTelemetryModal, setShowTelemetryModal] = useState(false);',
  eventLogic
);

fs.writeFileSync('src/App.tsx', c);
