import Badge from "../../../shared/components/ui/Badge";
import { getCategoryColor } from "../categoryColors";

/**
 * Colored category label. Reused later on event cards and event details.
 * category: { id, name }
 */
const CategoryBadge = ({ category }) => {
  if (!category) return null;

  return <Badge color={getCategoryColor(category.id)}>{category.name}</Badge>;
};

export default CategoryBadge;
