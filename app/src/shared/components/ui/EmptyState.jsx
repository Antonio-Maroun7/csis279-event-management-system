/**
 * Shown when a list has no items.
 */
const EmptyState = ({ icon = "○", title, text, action }) => {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
};

export default EmptyState;
