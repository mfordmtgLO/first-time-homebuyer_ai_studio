const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

const eventLogic = `  const [isTelemetryOpen, setIsTelemetryOpen] = useState(false);

  useEffect(() => {
    const handleOpenTelemetry = () => setIsTelemetryOpen(true);
    window.addEventListener('open-telemetry', handleOpenTelemetry);
    return () => window.removeEventListener('open-telemetry', handleOpenTelemetry);
  }, []);`;

c = c.replace(
  'const [isTelemetryOpen, setIsTelemetryOpen] = useState(false);',
  eventLogic
);

fs.writeFileSync('src/App.tsx', c);
