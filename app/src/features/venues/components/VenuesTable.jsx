import Button from "../../../shared/components/ui/Button";
import { formatNumber } from "../../../shared/utils/format";

/**
 * Admin table of venues.
 * A venue used by events cannot be deleted, so its Delete button is disabled.
 */
const VenuesTable = ({ venues, onEdit, onDelete }) => {
  return (
    <div className="card table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Venue</th>
            <th>City</th>
            <th>Capacity</th>
            <th>Events</th>
            <th className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {venues.map((venue) => {
            const inUse = venue.events_count > 0;

            return (
              <tr key={venue.id}>
                <td>
                  <div className="name-cell">{venue.name}</div>
                  <div className="small">{venue.address}</div>
                </td>
                <td>{venue.city}</td>
                <td>{formatNumber(venue.max_capacity)} seats</td>
                <td>
                  {inUse ? (
                    <span className="name-cell">
                      {venue.events_count}{" "}
                      {venue.events_count === 1 ? "event" : "events"}
                    </span>
                  ) : (
                    <span className="small">Not used yet</span>
                  )}
                </td>
                <td className="text-end">
                  <div className="table-actions">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(venue)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={inUse}
                      title={
                        inUse
                          ? "Used by events: it cannot be deleted"
                          : undefined
                      }
                      onClick={() => onDelete(venue)}
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

export default VenuesTable;
