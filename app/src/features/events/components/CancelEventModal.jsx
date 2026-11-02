import Button from "../../../shared/components/ui/Button";
import Modal from "../../../shared/components/ui/Modal";

/**
 * "Cancel this event?" dialog from the design.
 * Registrations and tickets are kept for history.
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
            longer accept registrations.
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
