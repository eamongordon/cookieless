import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type DocNode = {
  name: string;
  path: string;
  title?: string;
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
      const source = fs.readFileSync(entryPath, "utf8");
      const { data } = matter(source);
      return {
        name: entry.name.replace(/\.mdx$/, ""),
        path: urlPath,
        title: data.title || entry.name.replace(/\.mdx$/, ""),
      };
    }
    return null;
  }).filter(Boolean) as DocNode[];
}