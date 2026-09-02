const fs = require('fs');
let content = fs.readFileSync('src/components/RecruitmentPipeline.tsx', 'utf8');

if (!content.includes(' X,')) {
  content = content.replace(
    /from "lucide-react";/,
    ` X } from "lucide-react";`
  );
  content = content.replace(/Building, Award, MapPin\n\} from "lucide-react";/, 'Building, Award, MapPin, X\n} from "lucide-react";');
  fs.writeFileSync('src/components/RecruitmentPipeline.tsx', content);
  console.log("X imported");
}
