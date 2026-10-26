import { NavLink } from "react-router-dom";

/**
 * Bottom tab bar shown on phones (hidden on desktop by the CSS).
 */
const MobileBottomNav = ({ items }) => {
  if (!items.length) {
    return null;
  }

  return (
    <nav
      className="mobile-bottom"
      style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}
      aria-label="Mobile navigation"
    >
      {items.map((item) => (
        <NavLink key={item.to} to={item.to}>
          <span className="mobile-icon">{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default MobileBottomNav;
