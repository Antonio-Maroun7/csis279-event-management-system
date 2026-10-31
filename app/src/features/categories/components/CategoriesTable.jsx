import Button from "../../../shared/components/ui/Button";
import { formatDate } from "../../../shared/utils/format";
import CategoryBadge from "./CategoryBadge";

/**
 * Admin table of categories.
 * A category used by events cannot be deleted, so its Delete button is disabled.
 */
const CategoriesTable = ({ categories, onRename, onDelete }) => {
  return (
    <div className="card table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Events</th>
            <th>Created</th>
            <th className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => {
            const inUse = category.events_count > 0;

            return (
              <tr key={category.id}>
                <td>
                  <CategoryBadge category={category} />
                </td>
                <td>
                  {inUse ? (
                    <span className="name-cell">
                      {category.events_count}{" "}
                      {category.events_count === 1 ? "event" : "events"}
                    </span>
                  ) : (
                    <span className="small">Not used yet</span>
                  )}
                </td>
                <td>{formatDate(category.created_at)}</td>
                <td className="text-end">
                  <div className="table-actions">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRename(category)}
                    >
                      Rename
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={inUse}
                      title={
                        inUse
                          ? "Used by events: move them to another category first"
                          : undefined
                      }
                      onClick={() => onDelete(category)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CategoriesTable;
