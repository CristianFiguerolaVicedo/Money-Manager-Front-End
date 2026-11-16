// Subcategories (one level): helpers to show categories as a tree in lists and selects

const byName = (a, b) => (a.name || "").localeCompare(b.name || "", "es", { sensitivity: "base" });

// Main categories in alphabetical order, each followed by its subcategories (depth 1).
// A subcategory whose parent is not in the list (e.g. filtered by type) is shown as a main one.
export const categoryTree = (categories = []) => {
  const ids = new Set(categories.map((c) => c.id));
  const roots = categories.filter((c) => c.parentId == null || !ids.has(c.parentId)).sort(byName);
  const result = [];
  for (const root of roots) {
    result.push({ ...root, depth: 0 });
    categories
      .filter((c) => c.parentId === root.id)
      .sort(byName)
      .forEach((child) => result.push({ ...child, depth: 1, parentName: root.name }));
  }
  return result;
};

// Non-breaking spaces: normal ones are collapsed inside <option>
const INDENT = "\u00A0\u00A0\u00A0";

// Options for <select>: subcategories indented under their parent
export const categoryOptions = (categories = []) =>
  categoryTree(categories).map((c) => ({
    value: c.id,
    label: c.depth > 0 ? `${INDENT}↳ ${c.name}` : c.name,
  }));

// Categories that can be the parent of `category`: main ones of the same type, other than itself
export const parentCandidates = (categories = [], category = {}) =>
  categories
    .filter((c) => c.parentId == null && c.id !== category.id && c.type?.toLowerCase() === category.type?.toLowerCase())
    .sort(byName);

export const hasSubcategories = (categories = [], id) => id != null && categories.some((c) => c.parentId === id);
