import useForm from "../../../shared/hooks/useForm";
import Alert from "../../../shared/components/ui/Alert";
import Button from "../../../shared/components/ui/Button";
import FormField from "../../../shared/components/ui/FormField";
import Modal from "../../../shared/components/ui/Modal";
import { validateCategory } from "../categoryValidation";

/**
 * The form is only mounted while the dialog is open,
 * so it starts with the right name every time.
 */
const CategoryForm = ({ category, onSubmit, onCancel }) => {
  const { values, errors, formError, submitting, handleChange, handleSubmit } =
    useForm({ name: category?.name ?? "" }, validateCategory);

  return (
    <form
      onSubmit={handleSubmit((formValues) => onSubmit(formValues.name.trim()))}
      noValidate
    >
      <Alert variant="danger">{formError}</Alert>

      <FormField
        label="Category name"
        name="name"
        value={values.name}
        onChange={handleChange}
        error={errors.name}
        placeholder="e.g. Technology"
        help="Up to 100 characters. Two categories cannot have the same name."
        autoFocus
      />

      <div className="modal-actions">
        <Button variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {category ? "Save name" : "Add category"}
        </Button>
      </div>
    </form>
  );
};

/**
 * One dialog for both actions:
 * - category = null  -> "Add category"
 * - category = {...} -> "Rename category"
 */
const CategoryFormModal = ({ show, category, onSubmit, onClose }) => {
  return (
    <Modal
      show={show}
      title={category ? "Rename category" : "Add category"}
      icon="#"
      onClose={onClose}
    >
      <CategoryForm
        category={category}
        onSubmit={onSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
};

export default CategoryFormModal;
