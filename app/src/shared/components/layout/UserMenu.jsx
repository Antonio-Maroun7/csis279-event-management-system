import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../../features/auth/context/useAuth";
import { ROLE_COLORS, ROLE_LABELS } from "../../config/roles";
import { getFullName } from "../../utils/format";
import Avatar from "../ui/Avatar";
import Badge from "../ui/Badge";

/**
 * Avatar button in the top bar that opens a small menu (profile, log out).
 */
const UserMenu = () => {
  const { user, logout } = useAuth(); // Get the current user and logout function from the auth context
  const navigate = useNavigate();
  const [open, setOpen] = useState(false); // State to track if the user menu is open or closed
  const menuRef = useRef(null); // Ref to the user menu element for detecting outside clicks

  // close when clicking anywhere outside the menu
  useEffect(() => {
    if (!open) return undefined; // If the menu is not open, do nothing

    // Close the menu when clicking outside of it
    const handleClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false); // Close the menu if clicking outside of it
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleLogout = () => {
    setOpen(false); // Close the menu when logging out
    logout();
    navigate("/login");
  };

  return (
    <div className="user-menu" ref={menuRef}>
      <button
        type="button"
        className="avatar-btn"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
      >
        <Avatar user={user} />
      </button>

      {open && (
        <div className="user-menu-panel" role="menu">
          <div className="user-menu-head">
            <b>{getFullName(user)}</b>
            <span className="small">{user.email}</span>
            <Badge color={ROLE_COLORS[user.role]}>
              {ROLE_LABELS[user.role]}
            </Badge>
          </div>
          <Link to="/profile" role="menuitem" onClick={() => setOpen(false)}>
            Profile & preferences
          </Link>
          <button type="button" role="menuitem" onClick={handleLogout}>
            Log out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
