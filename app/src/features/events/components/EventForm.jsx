import useForm from "../../../shared/hooks/useForm";
import Alert from "../../../shared/components/ui/Alert";
import FormField from "../../../shared/components/ui/FormField";
import { toDateTimeLocal } from "../eventFormat";
import { validateEvent } from "../eventValidation";
import PublishCheckCard from "./PublishCheckCard";

const EMPTY_EVENT = {
  title: "",
  category_id: "",
  description: "",
  venue_id: "",
  capacity: "",
  start_time: "",
  end_time: "",
  price: "0",
};

/** Event from the API -> form values (all strings). */
const toFormValues = (event) => ({
  title: event.title,
  category_id: String(event.category.id),
  description: event.description || "",
  venue_id: String(event.venue.id),
  capacity: String(event.capacity),
  start_time: toDateTimeLocal(event.start_time),
  end_time: toDateTimeLocal(event.end_time),
  price: String(event.price),
});

/** Form values -> request body (numbers and ISO dates, like the API expects). */
const toRequestBody = (values) => ({
  title: values.title.trim(),
  description: values.description.trim(),
  category_id: Number(values.category_id),
  venue_id: Number(values.venue_id),
  capacity: Number(values.capacity),
  start_time: new Date(values.start_time).toISOString(),
  end_time: new Date(values.end_time).toISOString(),
  price: Number(values.price),
});

/**
 * Create / edit form (design 08). The side card holds the buttons:
 * onSave(body, action) with action = "draft" | "publish" | "save".
 * event = null when creating.
 */
const EventForm = ({ event, categories, venues, onSave, onCancelEvent }) => {
  const isNew = !event;
  const original = event ? toFormValues(event) : EMPTY_EVENT;

  // the selected venue is needed by the validation (capacity) and the checklist
  const findVenue = (venueId) =>
    venues.find((venue) => String(venue.id) === String(venueId));

  // a running event keeps its start time: it only has to be in the future if it changes
  const validate = (values) =>
    validateEvent(values, {
      venue: findVenue(values.venue_id),
      startMustBeFuture: isNew || values.start_time !== original.start_time,
    });

  const { values, errors, formError, submitting, handleChange, handleSubmit } =
    useForm(original, validate);

  const venue = findVenue(values.venue_id);
  const start = new Date(values.start_time);
  const end = new Date(values.end_time);

  const checks = [
    {
      label: "Required information is filled in",
      done: Boolean(
        values.title.trim() &&
        values.category_id &&
        values.venue_id &&
        values.capacity &&
        values.start_time &&
        values.end_time &&
        String(values.price).trim(),
      ),
    },
    {
      label: venue
        ? `Capacity fits ${venue.name} (${venue.max_capacity} seats)`
        : "Capacity fits the selected venue",
      done: Boolean(
        venue &&
        Number(values.capacity) >= 1 &&
        Number(values.capacity) <= venue.max_capacity,
      ),
    },
    {
      label: "End time is after the start time",
      done: Boolean(values.start_time && values.end_time && end > start),
    },
    {
      label: "Start time is in the future",
      done: Boolean(values.start_time && start > new Date()),
    },
  ];

  const save = (action) =>
    handleSubmit((formValues) => onSave(toRequestBody(formValues), action));

  return (
    <form
      className="form-layout"
      onSubmit={save(isNew ? "draft" : "save")}
      noValidate
    >
      <section className="card card-pad">
        <Alert variant="danger">{formError}</Alert>

        <div className="form-row">
          <FormField
            label="Event title"
            name="title"
            value={values.title}
            onChange={handleChange}
            error={errors.title}
            placeholder="e.g. AI & The Future of Software"
            autoFocus={isNew}
          />
          <FormField
            as="select"
            label="Category"
            name="category_id"
            value={values.category_id}
            onChange={handleChange}
            error={errors.category_id}
          >
            <option value="">Choose a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </FormField>
        </div>

        <FormField
          as="textarea"
          label="Description"
          name="description"
          value={values.description}
          onChange={handleChange}
          error={errors.description}
          placeholder="What will attendees see and learn?"
        />

        <div className="form-row">
          <FormField
            as="select"
            label="Venue"
            name="venue_id"
            value={values.venue_id}
            onChange={handleChange}
            error={errors.venue_id}
          >
            <option value="">Choose a venue</option>
            {venues.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} — {item.city} ({item.max_capacity} seats)
              </option>
            ))}
          </FormField>
          <FormField
            label="Capacity"
            name="capacity"
            type="number"
            min="1"
            step="1"
            value={values.capacity}
            onChange={handleChange}
            error={errors.capacity}
            placeholder="e.g. 100"
            help={
              venue
                ? `At most ${venue.max_capacity} seats at ${venue.name}.`
                : undefined
            }
          />
        </div>

        <div className="form-row">
          <FormField
            label="Start date & time"
            name="start_time"
            type="datetime-local"
            value={values.start_time}
            onChange={handleChange}
            error={errors.start_time}
          />
          <FormField
            label="End date & time"
            name="end_time"
            type="datetime-local"
            value={values.end_time}
            onChange={handleChange}
            error={errors.end_time}
          />
        </div>

        <div className="form-row">
          <FormField
            label="Price ($)"
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={values.price}
            onChange={handleChange}
            error={errors.price}
            help="Use 0 for a free event."
          />
        </div>
      </section>

      <PublishCheckCard
        checks={checks}
        isNew={isNew}
        isDraft={event?.status === "draft"}
        submitting={submitting}
        onSaveDraft={save("draft")}
        onPublish={save("publish")}
        onSaveChanges={save("save")}
        onCancelEvent={onCancelEvent}
      />
    </form>
  );
};

export default EventForm;
