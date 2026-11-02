import { useCallback, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useAuth from "../../auth/context/useAuth";
import useFetch from "../../../shared/hooks/useFetch";
import Alert from "../../../shared/components/ui/Alert";
import Button from "../../../shared/components/ui/Button";
import EmptyState from "../../../shared/components/ui/EmptyState";
import PageHeader from "../../../shared/components/ui/PageHeader";
import Spinner from "../../../shared/components/ui/Spinner";
import { getCategories } from "../../categories/services/categoryService";
import { getVenues } from "../../venues/services/venueService";
import CancelEventModal from "../components/CancelEventModal";
import EventForm from "../components/EventForm";
import { isEditable } from "../eventFormat";
import {
  cancelEvent,
  createEvent,
  getEvent,
  publishEvent,
  updateEvent,
} from "../services/eventService";

const DASHBOARD = "/organizer/dashboard";

/**
 * /organizer/events/new      -> create
 * /organizer/events/:id/edit -> edit
 */
const EventFormView = () => {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const { user } = useAuth();

  const [showCancel, setShowCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [pageError, setPageError] = useState("");

  // the form needs the categories, the venues and (when editing) the event
  const fetchFormData = useCallback(async () => {
    const [categoryData, venueData, event] = await Promise.all([
      getCategories(),
      getVenues(),
      isNew ? null : getEvent(id),
    ]);
    return {
      categories: categoryData.categories,
      venues: venueData.venues,
      event,
    };
  }, [id, isNew]);
  const { data, loading, error } = useFetch(fetchFormData);

  const backToDashboard = (message) =>
    navigate(DASHBOARD, { state: { message } });

  // errors thrown here are shown in the form by useForm
  const handleSave = async (body, action) => {
    if (isNew) {
      const status = action === "publish" ? "published" : "draft";
      const created = await createEvent({ ...body, status });
      backToDashboard(
        status === "published"
          ? `"${created.title}" was created and published.`
          : `"${created.title}" was saved as a draft.`,
      );
      return;
    }

    const updated = await updateEvent(id, body);
    if (action === "publish") {
      await publishEvent(id);
      backToDashboard(`"${updated.title}" was saved and published.`);
    } else {
      backToDashboard(`"${updated.title}" was updated.`);
    }
  };

  const handleConfirmCancel = async () => {
    try {
      setCancelling(true);
      await cancelEvent(id);
      backToDashboard(`"${data.event.title}" was cancelled.`);
    } catch (err) {
      setPageError(err.message);
      setShowCancel(false);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <Spinner label="Loading the event form..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <EmptyState
          icon="▦"
          title="This event cannot be opened"
          text={error}
          action={<Button to={DASHBOARD}>Back to dashboard</Button>}
        />
      </div>
    );
  }

  const { categories, venues, event } = data;

  // published events are public, so another organizer could open this URL:
  // the backend would refuse the save (403), we say it before they type anything
  const isMine =
    !event || user.role === "admin" || event.organizer.id === user.id;

  return (
    <>
      <Link to={DASHBOARD} className="back-link">
        ← Back to dashboard
      </Link>

      <PageHeader
        eyebrow="EVENT BUILDER"
        title={isNew ? "Create a new event" : `Edit "${event.title}"`}
        subtitle={
          isNew
            ? "Complete the details, save a draft, or publish when ready."
            : "Changes are visible to attendees as soon as you save."
        }
      />

      <Alert variant="danger" onClose={() => setPageError("")} className="mb-3">
        {pageError}
      </Alert>

      {!isMine ? (
        <div className="card">
          <EmptyState
            icon="✕"
            title="You can only manage your own events"
            text="This event belongs to another organizer."
            action={<Button to={`/events/${event.id}`}>View event</Button>}
          />
        </div>
      ) : event && !isEditable(event) ? (
        <div className="card">
          <EmptyState
            icon="✕"
            title="This event can no longer be edited"
            text={
              event.status === "cancelled"
                ? "It was cancelled. Its registrations stay in the history."
                : "It has already ended."
            }
            action={<Button to={`/events/${event.id}`}>View event</Button>}
          />
        </div>
      ) : (
        <EventForm
          event={event}
          categories={categories}
          venues={venues}
          onSave={handleSave}
          onCancelEvent={() => setShowCancel(true)}
        />
      )}

      <CancelEventModal
        event={showCancel ? event : null}
        loading={cancelling}
        onConfirm={handleConfirmCancel}
        onClose={() => setShowCancel(false)}
      />
    </>
  );
};

export default EventFormView;
