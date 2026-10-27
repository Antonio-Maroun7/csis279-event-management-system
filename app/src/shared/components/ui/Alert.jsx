/**
 * Message box. variant: info | success | danger
 * Pass onClose to show a close button.
 */
const Alert = ({ variant = "info", children, onClose, className = "" }) => {
  if (!children) {
    // if there is no content, don't render anything
    return null;
  }

  return (
    <div
      className={`notice notice-${variant} alert ${className}`}
      role={variant === "danger" ? "alert" : "status"} // set ARIA role based on variant
    >
      <span>{children}</span>
      {onClose && (
        <button
          type="button"
          className="alert-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;
