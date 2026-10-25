import { getInitials } from "../../utils/format";

/**
 * Square avatar with the user's initials.
 * size: sm (topbar / tables) | lg (profile page)
 */
const Avatar = ({ user, size = "sm" }) => {
  const initials = getInitials(user?.first_name, user?.last_name);
  return (
    <span
      className={size === "lg" ? "profile-avatar" : "avatar"}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
};

export default Avatar;
