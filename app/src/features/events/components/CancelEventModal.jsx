import Button from "../../../shared/components/ui/Button";
import Modal from "../../../shared/components/ui/Modal";

/**
 * "Cancel this event?" dialog from the design.
 * Registrations and tickets are kept for history; attendees are notified.
 */
const CancelEventModal = ({ event, loading, onConfirm, onClose }) => {
  return (
    <Modal
      show={Boolean(event)}
      title="Cancel this event?"
      icon="!"
      tone="danger"
      onClose={loading ? undefined : onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Keep event
          </Button>
          <Button variant="danger-solid" onClick={onConfirm} loading={loading}>
            Yes, cancel event
          </Button>
        </>
      }
    >
      {event && (
        <>
          <p>
            You are about to cancel <b>{event.title}</b>. The event will no
            longer accept registrations
            {event.seats_taken > 0 &&
              `, and its ${event.seats_taken} registered ${
                event.seats_taken === 1 ? "attendee" : "attendees"
              } will be notified`}
            .
          </p>
          <div className="notice notice-danger mt-3">
            This action changes the event status to cancelled. Existing
            registrations and tickets remain in the database for history.
          </div>
        </>
      )}
    </Modal>
  );
};

export default CancelEventModal;
