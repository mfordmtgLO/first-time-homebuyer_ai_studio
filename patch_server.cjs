const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const target = `      const { query } = req.body;
      if (!query || typeof query !== "string" || !query.trim()) {
        return res.status(400).json({ error: "LO search query required" });
      }

      const ai = getGeminiClient();
      const systemInstruction = \`You are a specialized AI Real Estate & Mortgage Intelligence Assistant.
Given a query like a branch name, team website, or company name, generate a comprehensive array of professional loan officer profiles. Return at least 3-5 realistic profiles to simulate scraping a team roster.

You MUST respond strictly with valid JSON containing a single array called "profiles" (no markdown fences). Structure:
{
  "profiles": [
    {
      "name": "Full LO Name",
      "title": "Professional Title (e.g., Senior Mortgage Advisor)",
      "nmlsId": "NMLS #123456",
      "company": "Brokerage / Firm Name",
      "branch": "Branch Name",
      "city": "City Name",
      "county": "County Name",
      "state": "State Name",
      "isTeamMember": false,
      "email": "professional.email@domain.com",
      "phone": "(503) 555-0192",
      "websiteUrl": "https://brokerage.com/lo-name",
      "headshotUrl": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
      "bio": "Comprehensive, compelling professional biography detailing mortgage experience, zero-down programs, etc.",
      "specialties": ["First-Time Homebuyers", "USDA 0% Down Loans", "Down Payment Assistance Grants"],
      "licenseStates": ["Oregon", "Washington"]
    }
  ]
}
Choose realistic Unsplash portrait images for headshotUrl.\`;`;

const replacement = `      const { query, minYearsExp, minUnits, minVolume, licenseStateFilter } = req.body;
      if (!query || typeof query !== "string" || !query.trim()) {
        return res.status(400).json({ error: "LO search query required" });
      }

      const ai = getGeminiClient();
      const systemInstruction = \`You are a specialized AI Real Estate & Mortgage Intelligence Assistant.
Given a query like a branch name, team website, or company name, generate a comprehensive array of professional loan officer profiles. Return at least 3-5 realistic profiles to simulate scraping a team roster.

STRICT RECRUITING FILTERS APPLIED:
- ALL returned loan officers MUST hold a mortgage license in: \${licenseStateFilter || 'Oregon (OR)'} (Ensure this is in their licenseStates array).
- ALL returned loan officers MUST have at least \${minYearsExp || 3} years of experience as a licensed LO.
- ALL returned loan officers MUST have closed at least \${minUnits || 20} units in the last 12 months.
- ALL returned loan officers MUST have produced at least $\${minVolume || 10} Million in volume in the last 12 months.

You MUST respond strictly with valid JSON containing a single array called "profiles" (no markdown fences). Structure:
{
  "profiles": [
    {
      "name": "Full LO Name",
      "title": "Professional Title (e.g., Senior Mortgage Advisor)",
      "nmlsId": "NMLS #123456",
      "company": "Brokerage / Firm Name",
      "branch": "Branch Name",
      "city": "City Name",
      "county": "County Name",
      "state": "State Name",
      "isTeamMember": false,
      "email": "professional.email@domain.com",
      "phone": "(503) 555-0192",
      "websiteUrl": "https://brokerage.com/lo-name",
      "headshotUrl": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
      "bio": "Comprehensive, compelling professional biography detailing mortgage experience, zero-down programs, etc.",
      "specialties": ["First-Time Homebuyers", "USDA 0% Down Loans", "Down Payment Assistance Grants"],
      "licenseStates": ["Oregon", "Washington"],
      "yearsExperience": 5,
      "production12MoVolume": 15000000,
      "production12MoUnits": 35
    }
  ]
}
Choose realistic Unsplash portrait images for headshotUrl.\`;`;

content = content.replace(target, replacement);
fs.writeFileSync('server.ts', content, 'utf8');
console.log('Replaced in server.ts');
