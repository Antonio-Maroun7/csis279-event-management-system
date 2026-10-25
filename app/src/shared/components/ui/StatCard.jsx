/**
 * Dashboard number card (Users, Venues, Seats filled...).
 */
const StatCard = ({ label, value, icon, hint }) => {
  return (
    <div className="card stat">
      <div className="stat-top">
        <span>{label}</span> // label for the stat card
        {icon && <div className="stat-icon">{icon}</div>}
      </div>
      <div className="stat-value">{value}</div>
      {hint && <div className="small">{hint}</div>}
    </div>
  );
};

export default StatCard;
