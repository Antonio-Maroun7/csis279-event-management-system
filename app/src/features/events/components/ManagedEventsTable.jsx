import { Link } from "react-router-dom";
import Button from "../../../shared/components/ui/Button";
import { formatDate, formatTime } from "../../../shared/utils/format";
import { getSeatsPercent, isEditable } from "../eventFormat";
import EventStatusBadge from "./EventStatusBadge";

/**
 * Organizer dashboard table: date, seats, status and the actions allowed
 * for each status:
 * - draft: Edit, Publish, Delete
 * - published (not ended): Edit, Cancel
 * - cancelled / ended: View only
 */
const ManagedEventsTable = ({
  events,
  busyEventId,
  onPublish,
  onCancel,
  onDelete,
}) => {
  return (
    <div className="card table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Event</th>
            <th>Date</th>
            <th>Registered</th>
            <th>Status</th>
            <th className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => {
            const busy = busyEventId === event.id;
            const editable = isEditable(event);

            return (
              <tr key={event.id}>
                <td>
                  <Link
                    to={`/events/${event.id}`}
                    className="name-cell title-link"
                  >
                    {event.title}
                  </Link>
                  <div className="small">
                    {event.venue.name}, {event.venue.city}
                  </div>
                </td>
                <td>
                  {formatDate(event.start_time)}
                  <div className="small">{formatTime(event.start_time)}</div>
                </td>
                <td>
                  <b>
                    {event.seats_taken} / {event.capacity}
                  </b>
                  <div className="progress table-progress">
                    <span style={{ width: `${getSeatsPercent(event)}%` }} />
                  </div>
                </td>
                <td>
                  <EventStatusBadge event={event} />
                </td>
                <td className="text-end">
                  <div className="table-actions">
                    {editable ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        to={`/organizer/events/${event.id}/edit`}
                      >
                        Edit
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        to={`/events/${event.id}`}
                      >
                        View
                      </Button>
                    )}
                    {event.status === "draft" && editable && (
                      <Button
                        variant="success"
                        size="sm"
                        loading={busy}
                        onClick={() => onPublish(event)}
                      >
                        Publish
                      </Button>
                    )}
                    {event.status === "draft" && (
                      <Button
                        variant="danger"
                        size="sm"
                        disabled={busy}
                        onClick={() => onDelete(event)}
                      >
                        Delete
                      </Button>
                    )}
                    {event.status === "published" && editable && (
                      <Button
                        variant="danger"
                        size="sm"
                        disabled={busy}
                        onClick={() => onCancel(event)}
                      >
                        Cancel
                      </Button>
                    )}
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

export default ManagedEventsTable;
