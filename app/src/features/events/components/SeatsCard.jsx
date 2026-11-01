import { useState } from "react";
import Button from "../../../shared/components/ui/Button";
import { formatPrice, getSeatsPercent } from "../eventFormat";

/**
 * Side card of Event Details: seats taken / capacity, progress bar, price.
 * `children` is where the register button goes (added with registrations).
 */
const SeatsCard = ({ event, children }) => {
  const [copied, setCopied] = useState(false); // state to track if the share link has been copied
  const soldOut = event.seats_left === 0;

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked by the browser: nothing to do
    }
  };

  return (
    <aside className="card card-pad sticky-card">
      <div className="small">Registration</div>

      <div className="seat-count">
        <div>
          <div className="seat-count-value">
            {event.seats_taken} <span>/ {event.capacity}</span>
          </div>
          <div className="small">confirmed attendees</div>
        </div>
        {event.status === "published" && !event.is_past && (
          <span className="live">
            {soldOut ? "Sold out" : `${event.seats_left} seats left`}
          </span>
        )}
      </div>

      <div className="progress" aria-label="Seats taken">
        <span style={{ width: `${getSeatsPercent(event)}%` }} />
      </div>

      {event.status === "cancelled" && (
        <div className="notice notice-danger mt-3">
          This event was cancelled by the organizer.
        </div>
      )}
      {event.status === "draft" && (
        <div className="notice notice-info mt-3">
          This is a draft: only you can see it until it is published.
        </div>
      )}
      {event.status === "published" && event.is_past && (
        <div className="notice notice-info mt-3">This event has ended.</div>
      )}

      <div className="mt-4">
        <div className="small">Price</div>
        <div className="big-price">{formatPrice(event.price)}</div>
      </div>

      {children}

      <Button variant="ghost" full className="mt-2" onClick={handleShare}>
        {copied ? "Link copied ✓" : "Share event"}
      </Button>
    </aside>
  );
};

export default SeatsCard;
