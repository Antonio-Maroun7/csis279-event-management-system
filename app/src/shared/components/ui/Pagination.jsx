/**
 * Previous / next pagination with the current page number.
 */
const Pagination = ({ page, totalPages, total, onPageChange }) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="pagination">
      <span className="small">
        Page {page} of {totalPages}
        {total !== undefined && ` · ${total} results`}
      </span>
      <div className="pagination-buttons">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          ← Previous
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default Pagination;
