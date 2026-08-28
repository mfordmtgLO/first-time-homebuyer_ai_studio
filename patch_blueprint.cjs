const fs = require('fs');
const file = 'firebase-blueprint.json';
const bp = JSON.parse(fs.readFileSync(file, 'utf8'));

bp.entities["EmailTemplate"] = {
  title: "EmailTemplate",
  description: "Draft email templates for agent outreach",
  type: "object",
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    subject: { type: "string" },
    body: { type: "string" },
    isArchived: { type: "boolean" },
    createdAt: { type: "string" },
    updatedAt: { type: "string" },
    ownerId: { type: "string" }
  },
  required: ["id", "title", "subject", "body", "isArchived", "ownerId"]
};

bp.firestore["email_templates/{templateId}"] = {
  schema: "EmailTemplate",
  description: "Email templates created by loan officers"
};

fs.writeFileSync(file, JSON.stringify(bp, null, 2));
