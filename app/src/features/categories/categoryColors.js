/**
 * Every category gets a badge color from its id, in the same order as the
 * admin dashboard design (Technology purple, Sports green, Workshop amber...).
 * The id never changes, so a renamed category keeps its color.
 */
const CATEGORY_COLORS = ["purple", "green", "amber", "blue", "slate", "red"];

export const getCategoryColor = (id) =>
  CATEGORY_COLORS[(Number(id) - 1) % CATEGORY_COLORS.length] || "slate";
