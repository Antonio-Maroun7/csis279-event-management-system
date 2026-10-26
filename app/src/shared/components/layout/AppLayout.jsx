import { NavLink, Outlet } from "react-router-dom";
import useAuth from "../../../features/auth/context/useAuth";
import { getNavItems } from "../../config/roles";
import BrandLogo from "../ui/BrandLogo";
import MobileBottomNav from "./MobileBottomNav";
import UserMenu from "./UserMenu";

/**
 * Attendee layout: top bar with links + page content + mobile bottom bar.
 */
const AppLayout = () => {
  const { user } = useAuth();
  const items = getNavItems(user.role);

  return (
    <div className="app">
      <header className="topbar">
        <BrandLogo />
        <nav className="nav" aria-label="Main navigation">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="actions">
          <UserMenu />
        </div>
      </header>

      <main className="container">
        <Outlet />
      </main>

      <MobileBottomNav items={items} />
    </div>
  );
};

export default AppLayout;
