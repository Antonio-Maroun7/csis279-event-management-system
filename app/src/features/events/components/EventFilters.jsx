/**
 * Search box + category and city filters above the events grid.
 * categories: [{ id, name }], cities: ["Beirut", ...]
 */
const EventFilters = ({
  search,
  categoryId,
  city,
  categories,
  cities,
  onSearchChange,
  onCategoryChange,
  onCityChange,
}) => {
  return (
    <div className="toolbar">
      <div className="search">
        <input
          className="input"
          type="search"
          placeholder="Search events"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          aria-label="Search events"
        />
      </div>
      <select
        className="select select-auto"
        value={categoryId}
        onChange={(event) => onCategoryChange(event.target.value)}
        aria-label="Filter by category"
      >
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      <select
        className="select select-auto"
        value={city}
        onChange={(event) => onCityChange(event.target.value)}
        aria-label="Filter by city"
      >
        <option value="">All cities</option>
        {cities.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default EventFilters;
