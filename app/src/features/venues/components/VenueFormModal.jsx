import useForm from "../../../shared/hooks/useForm";
import Alert from "../../../shared/components/ui/Alert";
import Button from "../../../shared/components/ui/Button";
import FormField from "../../../shared/components/ui/FormField";
import Modal from "../../../shared/components/ui/Modal";
import { MAX_VENUE_CAPACITY, validateVenue } from "../venueValidation";

const EMPTY_VENUE = { name: "", address: "", city: "", max_capacity: "" };

/**
 * The form is only mounted while the dialog is open,
 * so it starts with the right values every time.
 */
const VenueForm = ({ venue, onSubmit, onCancel }) => {
  const { values, errors, formError, submitting, handleChange, handleSubmit } =
    useForm(
      venue
        ? {
            name: venue.name,
            address: venue.address,
            city: venue.city,
            max_capacity: String(venue.max_capacity),
          }
        : EMPTY_VENUE,
      validateVenue,
    );

  // trim the text and send the capacity as a number
  const submit = (formValues) =>
    onSubmit({
      name: formValues.name.trim(),
      address: formValues.address.trim(),
      city: formValues.city.trim(),
      max_capacity: Number(formValues.max_capacity),
    });

  return (
    <form onSubmit={handleSubmit(submit)} noValidate>
      <Alert variant="danger">{formError}</Alert>

      <FormField
        label="Venue name"
        name="name"
        value={values.name}
        onChange={handleChange}
        error={errors.name}
        placeholder="e.g. Innovation Hall"
        autoFocus
      />
      <FormField
        label="Address"
        name="address"
        value={values.address}
        onChange={handleChange}
        error={errors.address}
        placeholder="e.g. University Campus, Block A"
      />
      <div className="form-row">
        <FormField
          label="City"
          name="city"
          value={values.city}
          onChange={handleChange}
          error={errors.city}
          placeholder="e.g. Koura"
        />
        <FormField
          label="Max capacity"
          name="max_capacity"
          type="number"
          min="1"
          max={MAX_VENUE_CAPACITY}
          step="1"
          value={values.max_capacity}
          onChange={handleChange}
          error={errors.max_capacity}
          placeholder="e.g. 300"
        />
      </div>

      {venue?.events_count > 0 && (
        <div className="notice notice-info mb-3">
          This venue already hosts {venue.events_count}{" "}
          {venue.events_count === 1 ? "event" : "events"}. The capacity cannot
          go below the seats of an upcoming event held here.
        </div>
      )}

      <div className="modal-actions">
        <Button variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {venue ? "Save changes" : "Add venue"}
        </Button>
      </div>
    </form>
  );
};

/**
 * One dialog for both actions:
 * - venue = null  -> "Add venue"
 * - venue = {...} -> "Edit venue"
 */
const VenueFormModal = ({ show, venue, onSubmit, onClose }) => {
  return (
    <Modal
      show={show}
      title={venue ? "Edit venue" : "Add venue"}
      icon="⌂"
      onClose={onClose}
    >
      <VenueForm venue={venue} onSubmit={onSubmit} onCancel={onClose} />
    </Modal>
  );
};

export default VenueFormModal;
