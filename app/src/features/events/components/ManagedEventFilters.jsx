import { EVENT_STATUS } from "../eventFormat";

/**
 * Search box + status filter above the organizer's events table.
 */
const ManagedEventFilters = ({
  search,
  status,
  onSearchChange,
  onStatusChange,
}) => {
  return (
    <div className="toolbar">
      <div className="search">
        <input
          className="input"
          type="search"
          placeholder="Search my events"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          aria-label="Search my events"
        />
      </div>
      <select
        className="select select-auto"
        value={status}
        onChange={(event) => onStatusChange(event.target.value)}
        aria-label="Filter by status"
      >
        <option value="">All statuses</option>
        {Object.entries(EVENT_STATUS).map(([value, { label }]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ManagedEventFilters;
