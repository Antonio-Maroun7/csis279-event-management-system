import Button from "../../../shared/components/ui/Button";
import { formatTime } from "../../../shared/utils/format";
import CategoryBadge from "../../categories/components/CategoryBadge";
import { getCategoryColor } from "../../categories/categoryColors";
import { formatPrice, getDateParts } from "../eventFormat";

/**
 * One event in the Events Home grid.
 * The cover color follows the category color, like the badge.
 */
const EventCard = ({ event }) => {
  const { day, month } = getDateParts(event.start_time);
  const color = getCategoryColor(event.category.id);

  return (
    <article className="card event-card">
      <div className={`event-cover cover-${color}`}>
        <div className="date-box">
          <b>{day}</b>
          <span>{month}</span>
        </div>
      </div>

      <div className="event-body">
        <div>
          <CategoryBadge category={event.category} />
        </div>
        <div className="event-title">{event.title}</div>
        <div className="meta">
          <span>◷ {formatTime(event.start_time)}</span>
          <span>
            ⌖ {event.venue.name}, {event.venue.city}
          </span>
        </div>
        {event.seats_left === 0 && <div className="small mt-1">Sold out</div>}

        <div className="event-footer">
          <span className="price">{formatPrice(event.price)}</span>
          <Button variant="secondary" size="sm" to={`/events/${event.id}`}>
            View details
          </Button>
        </div>
      </div>
    </article>
  );
};

export default EventCard;
