/**
 * Search box above the categories table.
 */
const CategoryFilters = ({ search, onSearchChange }) => {
  return (
    <div className="toolbar">
      <div className="search">
        <input
          className="input"
          type="search"
          placeholder="Search categories"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          aria-label="Search categories"
        />
      </div>
    </div>
  );
};

export default CategoryFilters;
