import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type DocNode = {
  name: string;
  path: string;
  title?: string;
  category?: string;
  order?: number;
};

// Category ordering - controls display order in navigation
const CATEGORY_ORDER: Record<string, number> = {
  "API Reference": 1,
};

export function getDocsTree(dir = path.join(process.cwd(), "/markdown")): DocNode[] {
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
        category: data.category,
        order: data.order ?? Infinity
      };
    })
    .sort((a, b) => {
      // Root-level docs first, then categorized docs
      if (!a.category && b.category) return -1;
      if (a.category && !b.category) return 1;
      
      // Both root-level: sort by order then title
      if (!a.category && !b.category) {
        const orderDiff = (a.order ?? Infinity) - (b.order ?? Infinity);
        if (orderDiff !== 0) return orderDiff;
        return (a.title || "").localeCompare(b.title || "");
      }
      
      // Both categorized: sort by category order, then doc order
      const aCategoryOrder = CATEGORY_ORDER[a.category!] ?? Infinity;
      const bCategoryOrder = CATEGORY_ORDER[b.category!] ?? Infinity;
      const categoryDiff = aCategoryOrder - bCategoryOrder;
      if (categoryDiff !== 0) return categoryDiff;
      
      const categoryNameDiff = a.category!.localeCompare(b.category!);
      if (categoryNameDiff !== 0) return categoryNameDiff;
      
      const orderDiff = (a.order ?? Infinity) - (b.order ?? Infinity);
      if (orderDiff !== 0) return orderDiff;
      
      return (a.title || "").localeCompare(b.title || "");
    });
}

// Group docs by category with proper ordering
export function groupDocsByCategory(docs: DocNode[]): { root: DocNode[], categorized: Record<string, DocNode[]> } {
  const root: DocNode[] = [];
  const categorized: Record<string, DocNode[]> = {};
  
  docs.forEach(doc => {
    if (!doc.category) {
      root.push(doc);
    } else {
      if (!categorized[doc.category]) {
        categorized[doc.category] = [];
      }
      categorized[doc.category]!.push(doc);
    }
  });
  
  // Sort root docs by order
  root.sort((a, b) => {
    const orderDiff = (a.order ?? Infinity) - (b.order ?? Infinity);
    if (orderDiff !== 0) return orderDiff;
    return (a.title || "").localeCompare(b.title || "");
  });
  
  // Sort each category's docs by order
  Object.keys(categorized).forEach(category => {
    const categoryDocs = categorized[category];
    if (categoryDocs) {
      categoryDocs.sort((a, b) => {
        const orderDiff = (a.order ?? Infinity) - (b.order ?? Infinity);
        if (orderDiff !== 0) return orderDiff;
        return (a.title || "").localeCompare(b.title || "");
      });
    }
  });
  
  return { root, categorized };
}

// Get ordered category names (excluding root-level docs)
export function getOrderedCategories(docs: DocNode[]): string[] {
  const categories = Array.from(new Set(
    docs
      .map(doc => doc.category)
      .filter((category): category is string => Boolean(category))
  ));
  
  return categories.sort((a, b) => {
    const aOrder = CATEGORY_ORDER[a] ?? Infinity;
    const bOrder = CATEGORY_ORDER[b] ?? Infinity;
    
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.localeCompare(b);
  });
}

// Get root-level docs (no category)
export function getRootDocs(docs: DocNode[]): DocNode[] {
  return docs
    .filter(doc => !doc.category)
    .sort((a, b) => {
      const orderDiff = (a.order ?? Infinity) - (b.order ?? Infinity);
      if (orderDiff !== 0) return orderDiff;
      return (a.title || "").localeCompare(b.title || "");
    });
}