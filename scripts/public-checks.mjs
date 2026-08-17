import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const requiredFiles = ["README.md", "IDEAS.md", "package.json"];

for (const rel of requiredFiles) {
  if (!fs.existsSync(path.join(root, rel))) {
    failures.push(`Missing required file: ${rel}`);
  }
}

const ideasPath = path.join(root, "IDEAS.md");
if (fs.existsSync(ideasPath)) {
  const ideas = fs.readFileSync(ideasPath, "utf8");

  for (const heading of ["## Idea 1", "## Idea 2", "## Idea 3"]) {
    if (!ideas.includes(heading)) {
      failures.push(`IDEAS.md missing section: ${heading}`);
    }
  }

  const todoCount = (ideas.match(/\bTODO\b/g) || []).length;
  if (todoCount > 8) {
    failures.push(
      `IDEAS.md still has too many TODO placeholders (${todoCount}). Fill the three ideas.`,
    );
  }

  if (ideas.includes("TODO: short title")) {
    failures.push("Replace idea titles (still says TODO: short title)");
  }

  const minChars = 1200;
  if (ideas.trim().length < minChars) {
    failures.push(
      `IDEAS.md looks incomplete (public check expects ~${minChars}+ characters of real content)`,
    );
  }

  // Soft signals that Ch.2-style sections were used at least once across the file
  const signals = [
    ["### Problem", "Problem"],
    ["### Functional requirements", "Functional requirements"],
    ["### Non-functional requirements", "Non-functional requirements"],
  ];
  for (const [needle, label] of signals) {
    if (!ideas.includes(needle)) {
      failures.push(`IDEAS.md should keep the "${label}" prompts`);
    }
  }
}

if (failures.length) {
  console.error("Public checks failed:\n");
  for (const f of failures) console.error(` - ${f}`);
  process.exit(1);
}

console.log("Public checks passed.");
