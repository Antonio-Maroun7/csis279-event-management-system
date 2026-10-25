import { useEffect } from "react";

/**
 * Dialog shown above the page. Closes with the Escape key or a click outside.
 * tone: default | danger (changes the icon colors)
 */
const Modal = ({
  show,
  title,
  icon,
  tone = "default",
  onClose,
  children,
  footer,
}) => {
  useEffect(() => {
    if (!show) return undefined;

    const handleKey = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [show, onClose]);

  if (!show) {
    return null;
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {icon && <div className={`modal-icon modal-icon-${tone}`}>{icon}</div>}
        <h2 id="modal-title">{title}</h2>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-actions">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
