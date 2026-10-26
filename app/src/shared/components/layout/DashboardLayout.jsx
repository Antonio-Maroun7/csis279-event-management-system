import { NavLink, Outlet, useNavigate } from "react-router-dom";
import useAuth from "../../../features/auth/context/useAuth";
import { getNavItems, ROLE_LABELS } from "../../config/roles";
import { getFullName } from "../../utils/format";
import BrandLogo from "../ui/BrandLogo";
import MobileBottomNav from "./MobileBottomNav";
import UserMenu from "./UserMenu";

/**
 * Organizer / admin layout: dark sidebar + top bar + page content.
 * On phones the sidebar is hidden and the bottom bar is used instead.
 */
const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = getNavItems(user.role);
  const workspace =
    user.role === "admin" ? "Admin workspace" : "Organizer workspace";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="sidebar-layout">
      <aside className="side">
        <BrandLogo />
        <div className="side-label">Workspace</div>
        <nav className="side-nav" aria-label="Workspace navigation">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to}>
              <span className="side-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="side-foot">
          <div className="side-user">
            <div className="side-user-name">{getFullName(user)}</div>
            <div className="side-user-role">{ROLE_LABELS[user.role]}</div>
            <button
              type="button"
              className="side-logout"
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>
        </div>
      </aside>

      <section className="side-main">
        <header className="topbar">
          <div className="topbar-mobile-brand">
            <BrandLogo />
          </div>
          <div className="topbar-title">
            <b>{workspace}</b>
            <span>Event Management System</span>
          </div>
          <div className="actions">
            <UserMenu />
          </div>
        </header>

        <main className="container">
          <Outlet />
        </main>
      </section>

      <MobileBottomNav items={items} />
    </div>
  );
};

export default DashboardLayout;
