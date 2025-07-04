import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type DocNode = {
  name: string;
  path: string;
  title?: string;
  category?: string;
};

export function getDocsTree(dir = path.join(process.cwd(), "/markdown")): DocNode[] {
  // Only read .mdx files in the flat directory, excluding introduction
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".mdx") && entry.name !== "introduction.mdx")
    .map((entry) => {
      const entryPath = path.join(dir, entry.name);
      const urlPath = entry.name.replace(/\\/g, "/").replace(/\.mdx$/, "");
      const source = fs.readFileSync(entryPath, "utf8");
      const { data } = matter(source);
      return {
        name: entry.name.replace(/\.mdx$/, ""),
        path: urlPath,
        title: data.title || entry.name.replace(/\.mdx$/, ""),
        category: data.category
      };
    });
}