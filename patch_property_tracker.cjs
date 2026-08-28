const fs = require('fs');
const file = 'src/components/PropertyTracker.tsx';
let content = fs.readFileSync(file, 'utf8');

// Update filter logic
const oldFilterLogic = `    // 1. Status Filter
    if (filterStatus !== "all" && p.status !== filterStatus) {
      if (filterStatus === "offered" && p.status !== "under_contract") return false;
      if (filterStatus !== "offered") return false;
    }`;

const newFilterLogic = `    // 1. Status Filter
    if (filterStatus === "favorites" && !p.isFavorite) return false;
    if (filterStatus === "consideration" && p.status !== "saved" && p.status !== "touring") return false;
    if (filterStatus === "offered" && p.status !== "offered" && p.status !== "under_contract") return false;
    if (filterStatus === "archived" && p.status !== "passed") return false;`;

content = content.replace(oldFilterLogic, newFilterLogic);

// Update buttons
const oldButtons = `          {[
            { id: "all", label: \`All Pipeline (\${properties.length})\` },
            { id: "touring", label: \`Touring / Open House (\${properties.filter(p => p.status === "touring").length})\` },
            { id: "saved", label: \`Saved (\${properties.filter(p => p.status === "saved").length})\` },
            { id: "offered", label: \`Offered / Under Contract (\${properties.filter(p => p.status === "offered" || p.status === "under_contract").length})\` },
          ].map(tab => (`;

const newButtons = `          {[
            { id: "all", label: \`All Pipeline (\${properties.length})\` },
            { id: "favorites", label: \`Favorites (\${properties.filter(p => p.isFavorite).length})\` },
            { id: "consideration", label: \`Under Consideration (\${properties.filter(p => p.status === "saved" || p.status === "touring").length})\` },
            { id: "offered", label: \`Offered / Contract (\${properties.filter(p => p.status === "offered" || p.status === "under_contract").length})\` },
            { id: "archived", label: \`Archived (\${properties.filter(p => p.status === "passed").length})\` },
          ].map(tab => (`;

content = content.replace(oldButtons, newButtons);

fs.writeFileSync(file, content);
