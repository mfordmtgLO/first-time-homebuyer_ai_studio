const fs = require('fs');
let c = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

const regex = /const fetchDailyReview = async \(forceRefresh = false\) => \{\s*setDailyReviewLoading\(true\);\s*try \{\s*const now = new Date\(\);\s*const hour = now\.getHours\(\);\s*const minute = now\.getMinutes\(\);\s*let phase: DailyPulsePhase = "morning";\s*if \(hour >= 11 && \(hour < 14 \|\| \(hour === 14 && minute < 30\)\)\) phase = "midday";\s*else if \(hour >= 14 && \(hour < 16 \|\| \(hour === 16 && minute < 30\)\)\) phase = "afternoon";\s*else if \(hour >= 16\) phase = "end_of_day";\s*const timeString = now\.toLocaleTimeString\(\[\], \{ hour: "numeric", minute: "2-digit" \}\);\s*const todayStr = now\.toISOString\(\)\.split\("T"\)\[0\];\s*let completedTasks: string\[\] = \[\];\s*let pendingTasks: string\[\] = \[\];\s*let allTasksSnapshot: any\[\] = \[\];/;

const newLogic = `  const fetchDailyReview = async (forceRefresh = false) => {
    setDailyReviewLoading(true);

    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    let phase: DailyPulsePhase = "morning";
    if (hour >= 11 && (hour < 14 || (hour === 14 && minute < 30))) phase = "midday";
    else if (hour >= 14 && (hour < 16 || (hour === 16 && minute < 30))) phase = "afternoon";
    else if (hour >= 16) phase = "end_of_day";

    const timeString = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    const todayStr = now.toISOString().split("T")[0];

    let completedTasks: string[] = [];
    let pendingTasks: string[] = [];
    let allTasksSnapshot: any[] = [];

    try {`;

c = c.replace(regex, newLogic);
fs.writeFileSync('src/components/LoanOfficerPortal.tsx', c);
