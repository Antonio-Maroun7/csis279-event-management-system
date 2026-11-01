import Badge from "../../../shared/components/ui/Badge";
import { EVENT_STATUS } from "../eventFormat";

/**
 * Colored status label: Draft, Published, Cancelled, Completed.
 * A published event that already ended is shown as "Ended".
 */
const EventStatusBadge = ({ event }) => {
  if (event.status === "published" && event.is_past) {
    return <Badge color="blue">Ended</Badge>;
  }

  const { label, color } = EVENT_STATUS[event.status] || EVENT_STATUS.draft;
  return <Badge color={color}>{label}</Badge>;
};

export default EventStatusBadge;
