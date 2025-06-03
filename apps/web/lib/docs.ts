import fs from "fs";
import path from "path";

export type DocNode = {
  name: string;
  path: string;
  children?: DocNode[];
};

export function getDocsTree(dir = path.join(process.cwd(), "/markdown"), base = ""): DocNode[] {
  return fs.readdirSync(dir, { withFileTypes: true }).map((entry) => {
    const entryPath = path.join(dir, entry.name);
    const urlPath = path.join(base, entry.name).replace(/\\/g, "/").replace(/\.mdx$/, "");
    if (entry.isDirectory()) {
      return {
        name: entry.name,
        path: urlPath,
        children: getDocsTree(entryPath, urlPath),
      };
    } else if (entry.name.endsWith(".mdx")) {
      return {
        name: entry.name.replace(/\.mdx$/, ""),
        path: urlPath,
      };
    }
    return null;
  }).filter(Boolean) as DocNode[];
}