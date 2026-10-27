import Button from "./Button";
import Modal from "./Modal";

/**
 * "Are you sure?" dialog. Reused for deleting users, cancelling events, etc.
 */
const ConfirmModal = ({
  show,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Keep it",
  variant = "danger",
  icon = "!",
  loading = false,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      show={show}
      title={title}
      icon={icon}
      tone={variant === "danger" ? "danger" : "default"}
      onClose={loading ? undefined : onCancel}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "danger" ? "danger-solid" : "primary"}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p>{message}</p>
    </Modal>
  );
};

export default ConfirmModal;
