import { useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import useFetch from "../../../shared/hooks/useFetch";
import Button from "../../../shared/components/ui/Button";
import EmptyState from "../../../shared/components/ui/EmptyState";
import Spinner from "../../../shared/components/ui/Spinner";
import EventInfo from "../components/EventInfo";
import SeatsCard from "../components/SeatsCard";
import { getEvent } from "../services/eventService";

const EventDetailsView = () => {
  const { id } = useParams();

  // a new id (another event) loads again
  const fetchEvent = useCallback(() => getEvent(id), [id]);
  const { data: event, loading, error } = useFetch(fetchEvent);

  if (loading) {
    return (
      <div className="card">
        <Spinner label="Loading event..." />
      </div>
    );
  }

  // 404 from the API, or a network error
  if (error || !event) {
    return (
      <div className="card">
        <EmptyState
          icon="▦"
          title="Event not found"
          text="This event does not exist, or it is not published yet."
          action={<Button to="/events">Back to events</Button>}
        />
      </div>
    );
  }

  return (
    <>
      <Link to="/events" className="back-link">
        ← All events
      </Link>

      <div className="detail-layout">
        <EventInfo event={event} />
        <SeatsCard event={event} />
      </div>
    </>
  );
};

export default EventDetailsView;
