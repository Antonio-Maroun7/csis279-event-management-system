import {
  formatDateTime,
  formatTime,
  getFullName,
} from "../../../shared/utils/format";
import CategoryBadge from "../../categories/components/CategoryBadge";
import { getCategoryColor } from "../../categories/categoryColors";
import EventStatusBadge from "./EventStatusBadge";

/**
 * Main part of Event Details: cover, badges, title, date / venue / organizer, description.
 */
const EventInfo = ({ event }) => {
  return (
    <section>
      <div
        className={`cover-large cover-${getCategoryColor(event.category.id)}`}
      />

      <div className="card card-pad mt-3">
        <div className="badge-row">
          <CategoryBadge category={event.category} />
          <EventStatusBadge event={event} />
        </div>

        <h1 className="page-title mt-3">{event.title}</h1>

        <div className="grid grid-3 detail-facts">
          <div>
            <div className="small">Date & time</div>
            <b>
              {formatDateTime(event.start_time)} – {formatTime(event.end_time)}
            </b>
          </div>
          <div>
            <div className="small">Venue</div>
            <b>
              {event.venue.name}, {event.venue.city}
            </b>
            <div className="small">{event.venue.address}</div>
          </div>
          <div>
            <div className="small">Organizer</div>
            <b>{getFullName(event.organizer)}</b>
          </div>
        </div>

        <hr className="divider" />

        <h3 className="about-title">About this event</h3>
        <p className="subtitle pre-line">
          {event.description ||
            "The organizer has not added a description yet."}
        </p>
      </div>
    </section>
  );
};

export default EventInfo;
