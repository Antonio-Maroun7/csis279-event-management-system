import { ROLE_LABELS, ROLES } from "../../../shared/config/roles";

const UserFilters = ({ search, role, onSearchChange, onRoleChange }) => {
  return (
    <div>
      <div>
        <input
          className="input"
          type="search"
          placeholder="Search by name or email"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          aria-label="Search users"
        />
      </div>
      <select
        className="select select-auto"
        value={role}
        onChange={(event) => onRoleChange(event.target.value)}
        aria-label="Filter by role"
      >
        <option value="">All roles</option>
        {ROLES.map((value) => (
          <option key={value} value={value}>
            {ROLE_LABELS[value]}
          </option>
        ))}
      </select>
    </div>
  );
};
