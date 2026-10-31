/**
 * Search box + city filter above the venues table.
 * The city list comes from the venues themselves.
 */
const VenueFilters = ({
  search,
  city,
  cities,
  onSearchChange,
  onCityChange,
}) => {
  return (
    <div className="toolbar">
      <div className="search">
        <input
          className="input"
          type="search"
          placeholder="Search by name or address"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          aria-label="Search venues"
        />
      </div>
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

export default VenueFilters;
