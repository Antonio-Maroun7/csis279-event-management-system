import { useCallback, useState } from "react";
import { useLocation } from "react-router-dom";
import useAuth from "../../auth/context/useAuth";
import useDebounce from "../../../shared/hooks/useDebounce";
import useFetch from "../../../shared/hooks/useFetch";
import Alert from "../../../shared/components/ui/Alert";
import Button from "../../../shared/components/ui/Button";
import ConfirmModal from "../../../shared/components/ui/ConfirmModal";
import EmptyState from "../../../shared/components/ui/EmptyState";
import PageHeader from "../../../shared/components/ui/PageHeader";
import Pagination from "../../../shared/components/ui/Pagination";
import Spinner from "../../../shared/components/ui/Spinner";
import StatCard from "../../../shared/components/ui/StatCard";
import CancelEventModal from "../components/CancelEventModal";
import ManagedEventFilters from "../components/ManagedEventFilters";
import ManagedEventsTable from "../components/ManagedEventsTable";
import { formatNextEvent } from "../eventFormat";
import {
  cancelEvent,
  deleteEvent,
  getManagedEvents,
  publishEvent,
} from "../services/eventService";

const PAGE_SIZE = 10;

/** "Good morning" / "Good afternoon" / "Good evening" */
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const OrganizerDashboardView = () => {
  const { user } = useAuth();
  const location = useLocation();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search.trim());

  // message sent by the event form after saving ("Event published...")
  const [success, setSuccess] = useState(location.state?.message || "");
  const [busyEventId, setBusyEventId] = useState(null);
  const [eventToCancel, setEventToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchEvents = useCallback(
    () =>
      getManagedEvents({
        search: debouncedSearch,
        status,
        page,
        limit: PAGE_SIZE,
      }),
    [debouncedSearch, status, page],
  );
  const { data, loading, error, setError, reload } = useFetch(fetchEvents);

  const events = data?.events ?? [];
  const counts = data?.counts ?? {
    total: 0,
    draft: 0,
    published: 0,
    cancelled: 0,
  };
  const stats = data?.stats ?? {
    registrations: 0,
    upcoming: 0,
    next_start_time: null,
  };

  const changeFilter = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  // runs an action, shows its result and loads the table again
  const runAction = async (action, message) => {
    try {
      setError("");
      setSuccess("");
      await action();
      setSuccess(message);
      await reload();
    } catch (err) {
      await reload();
      setError(err.message);
    }
  };

  const handlePublish = async (event) => {
    setBusyEventId(event.id);
    await runAction(
      () => publishEvent(event.id),
      `"${event.title}" is now published and visible to attendees.`,
    );
    setBusyEventId(null);
  };

  const handleConfirmCancel = async () => {
    setCancelling(true);
    await runAction(
      () => cancelEvent(eventToCancel.id),
      `"${eventToCancel.title}" was cancelled.`,
    );
    setCancelling(false);
    setEventToCancel(null);
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    // deleting the last row of a page goes back one page
    if (events.length === 1 && page > 1) {
      try {
        setError("");
        setSuccess("");
        await deleteEvent(eventToDelete.id);
        setPage(page - 1);
        setSuccess(`Draft "${eventToDelete.title}" was deleted.`);
      } catch (err) {
        await reload();
        setError(err.message);
      }
    } else {
      await runAction(
        () => deleteEvent(eventToDelete.id),
        `Draft "${eventToDelete.title}" was deleted.`,
      );
    }
    setDeleting(false);
    setEventToDelete(null);
  };

  const hasFilters = Boolean(debouncedSearch || status);

  return (
    <>
      <PageHeader
        eyebrow="OVERVIEW"
        title={`${getGreeting()}, ${user.first_name}.`}
        subtitle="Here is what is happening across your events."
        actions={<Button to="/organizer/events/new">＋ Create event</Button>}
      />

      <div className="grid grid-4">
        <StatCard
          label="Total events"
          value={counts.total}
          icon="▦"
          hint={`${counts.published} published · ${counts.draft} drafts`}
        />
        <StatCard
          label="Registrations"
          value={stats.registrations}
          icon="◎"
          hint="Confirmed seats"
        />
        <StatCard
          label="Upcoming"
          value={stats.upcoming}
          icon="◷"
          hint={formatNextEvent(stats.next_start_time)}
        />
        <StatCard
          label="Cancelled"
          value={counts.cancelled}
          icon="✕"
          hint="Kept for history"
        />
      </div>

      <section className="mt-4">
        <div className="section-head">
          <div>
            <h2 className="section-title">My events</h2>
            <p className="subtitle">Capacity, status and quick actions.</p>
          </div>
          <ManagedEventFilters
            search={search}
            status={status}
            onSearchChange={changeFilter(setSearch)}
            onStatusChange={changeFilter(setStatus)}
          />
        </div>

        <Alert variant="danger" onClose={() => setError("")} className="mb-3">
          {error}
        </Alert>
        <Alert
          variant="success"
          onClose={() => setSuccess("")}
          className="mb-3"
        >
          {success}
        </Alert>

        {loading ? (
          <div className="card">
            <Spinner label="Loading your events..." />
          </div>
        ) : events.length === 0 ? (
          <div className="card">
            <EmptyState
              icon="▦"
              title={hasFilters ? "No events found" : "No events yet"}
              text={
                hasFilters
                  ? "Try another title or status."
                  : "Create your first event: save it as a draft or publish it right away."
              }
              action={
                !hasFilters && (
                  <Button to="/organizer/events/new">＋ Create event</Button>
                )
              }
            />
          </div>
        ) : (
          <>
            <ManagedEventsTable
              events={events}
              busyEventId={busyEventId}
              onPublish={handlePublish}
              onCancel={setEventToCancel}
              onDelete={setEventToDelete}
            />
            <Pagination
              page={data.page}
              totalPages={data.total_pages}
              total={data.total}
              onPageChange={setPage}
            />
          </>
        )}
      </section>

      <CancelEventModal
        event={eventToCancel}
        loading={cancelling}
        onConfirm={handleConfirmCancel}
        onClose={() => setEventToCancel(null)}
      />

      <ConfirmModal
        show={Boolean(eventToDelete)}
        title="Delete this draft?"
        message={
          eventToDelete &&
          `"${eventToDelete.title}" will be removed permanently. Published events are cancelled instead of deleted.`
        }
        confirmLabel="Delete draft"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setEventToDelete(null)}
      />
    </>
  );
};

export default OrganizerDashboardView;
