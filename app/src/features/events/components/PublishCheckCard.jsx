import Button from "../../../shared/components/ui/Button";

/**
 * Side card of the event form: a live checklist + the save buttons.
 * The buttons call the form's submit with "draft" or "published".
 */
const PublishCheckCard = ({
  checks,
  isNew,
  isDraft,
  submitting,
  onSaveDraft,
  onPublish,
  onSaveChanges,
  onCancelEvent,
}) => {
  const ready = checks.every((check) => check.done);

  return (
    <aside className="card card-pad sticky-card">
      <div className="eyebrow">PUBLISH CHECK</div>
      <h3 className="card-title mt-2">Ready to go live?</h3>
      <p className="subtitle">
        Event capacity must not exceed the selected venue capacity, and the end
        time must be after the start time.
      </p>

      <ul className="check-list">
        {checks.map((check) => (
          <li key={check.label} className={check.done ? "done" : ""}>
            {check.label}
          </li>
        ))}
      </ul>

      {ready && (
        <div className="notice notice-success mt-3">
          ✓ Required information is complete.
        </div>
      )}

      {isNew || isDraft ? (
        <>
          <Button
            full
            className="mt-4"
            loading={submitting}
            onClick={onPublish}
          >
            Publish event
          </Button>
          <Button
            variant="ghost"
            full
            className="mt-2"
            disabled={submitting}
            onClick={isNew ? onSaveDraft : onSaveChanges}
          >
            {isNew ? "Save draft" : "Save draft changes"}
          </Button>
        </>
      ) : (
        <Button
          full
          className="mt-4"
          loading={submitting}
          onClick={onSaveChanges}
        >
          Save changes
        </Button>
      )}

      {!isNew && (
        <Button
          variant="danger"
          full
          className="mt-2"
          disabled={submitting}
          onClick={onCancelEvent}
        >
          Cancel event…
        </Button>
      )}
    </aside>
  );
};

export default PublishCheckCard;
