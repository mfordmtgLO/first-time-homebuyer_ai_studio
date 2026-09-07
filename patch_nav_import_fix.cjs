const fs = require('fs');
let c = fs.readFileSync('src/components/PropertyCard.tsx', 'utf8');

// The previous sed matched the wrong import (motion/react). Let's fix that.
c = c.replace('import { Navigation, motion, AnimatePresence, PanInfo } from "motion/react";', 'import { motion, AnimatePresence, PanInfo } from "motion/react";');

// And add it correctly to lucide-react if not there yet
if (!c.includes('Navigation,')) {
    c = c.replace('import {\\n  Star,', 'import {\\n  Navigation,\\n  Star,');
}

fs.writeFileSync('src/components/PropertyCard.tsx', c);
