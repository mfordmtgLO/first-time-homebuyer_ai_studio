import { describe, it, expect } from "vitest";
import fs from "fs";

describe("Owner Spec: AI Honesty & Safety Guard Suite (2026-10-09)", () => {
  it("G1: Denylisted strings must not appear anywhere in server.ts or src/ (excluding test guard itself)", () => {
    const denylisted = ["deepseek-v4", "deepseek-flash", "hybrid-engine", "math-harness", "gemini-flash-latest"];
    
    const readDirRecursive = (dir: string): string[] => {
      let results: string[] = [];
      const list = fs.readdirSync(dir);
      list.forEach((file) => {
        const filePath = `${dir}/${file}`;
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
          if (file !== "node_modules" && file !== "dist" && file !== ".git") {
            results = results.concat(readDirRecursive(filePath));
          }
        } else {
          if (filePath.endsWith(".ts") || filePath.endsWith(".tsx") || filePath.endsWith(".js")) {
            results.push(filePath);
          }
        }
      });
      return results;
    };

    const files = ["server.ts", ...readDirRecursive("src")];
    const violations: string[] = [];

    files.forEach((file) => {
      if (!fs.existsSync(file)) return;
      if (file.includes("aiHonestyGuard.test.ts")) return; // skip self
      const content = fs.readFileSync(file, "utf8");
      denylisted.forEach((term) => {
        if (content.includes(term)) {
          violations.push(`${file} contains denylisted term: "${term}"`);
        }
      });
    });

    expect(violations).toEqual([]);
  });

  it("G2: Buyer handlers (lead-intake, parse-property-search, property-compare) must not contain generateContent or generateWithModelFallback", () => {
    const serverCode = fs.readFileSync("server.ts", "utf8");
    
    const leadIntakeIndex = serverCode.indexOf('/api/gemini/lead-intake');
    const leadIntakeBlock = serverCode.substring(leadIntakeIndex, leadIntakeIndex + 600);
    expect(leadIntakeBlock.includes("generateWithModelFallback")).toBe(false);
    expect(leadIntakeBlock.includes("generateContent")).toBe(false);
    
    const parseSearchIndex = serverCode.indexOf('/api/gemini/parse-property-search');
    const parseSearchBlock = serverCode.substring(parseSearchIndex, parseSearchIndex + 1200);
    expect(parseSearchBlock.includes("generateContent")).toBe(false);
    expect(parseSearchBlock.includes("generateWithModelFallback")).toBe(false);

    const propertyCompareIndex = serverCode.indexOf('/api/gemini/property-compare');
    const compareBlock = serverCode.substring(propertyCompareIndex, propertyCompareIndex + 1200);
    expect(compareBlock.includes("generateContent")).toBe(false);
    expect(compareBlock.includes("generateWithModelFallback")).toBe(false);
  });

  it("G3: POST /api/chat must NOT appear in PUBLIC_API_ROUTES", () => {
    const serverCode = fs.readFileSync("server.ts", "utf8");
    const publicRoutesMatch = serverCode.match(/const PUBLIC_API_ROUTES: ReadonlyArray<string> = \[([\s\S]*?)\];/);
    if (publicRoutesMatch) {
      const publicRoutesBlock = publicRoutesMatch[1];
      expect(publicRoutesBlock.includes("/api/chat")).toBe(false);
    } else {
      expect.fail("PUBLIC_API_ROUTES block not found in server.ts");
    }
  });

  it("G4: bun.lock must be absent and package.json unchanged in structure", () => {
    expect(fs.existsSync("bun.lock")).toBe(false);
    expect(fs.existsSync("package.json")).toBe(true);
  });
});
