/**
 * Everything that depends on the user role lives here:
 * labels, badge colors, navigation links and the home page of each role.
 * Later steps only add new links to NAV_ITEMS.
 */

export const ROLES = ["attendee", "organizer", "admin"];

export const ROLE_LABELS = {
  attendee: "Attendee",
  organizer: "Organizer",
  admin: "Administrator",
};

export const ROLE_COLORS = {
  attendee: "blue",
  organizer: "purple",
  admin: "amber",
};

export const NAV_ITEMS = {
  // navigation items for each role
  attendee: [{ to: "/profile", label: "Profile", icon: "◉" }], // navigation items for attendee role
  organizer: [{ to: "/profile", label: "Profile", icon: "◉" }], // navigation items for organizer role
  admin: [
    { to: "/admin/users", label: "Users", icon: "◎" },
    { to: "/admin/categories", label: "Categories", icon: "#" },
    { to: "/profile", label: "Profile", icon: "◉" },
  ], // navigation items for admin role
};

export const getNavItems = (role) => NAV_ITEMS[role] || []; // returns navigation items for the given role

// first page a user sees after logging in
export const getHomePath = (role) =>
  role === "admin" ? "/admin/users" : "/profile";
