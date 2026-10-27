import { ROLE_LABELS } from "../../../shared/config/roles";
import { formatDate } from "../../../shared/utils/format";

/**
 * Read-only list of the account information (label / value rows).
 */
const ProfileDetails = ({ user }) => {
  const rows = [
    ["First name", user.first_name],
    ["Last name", user.last_name],
    ["Email", user.email],
    ["Role", ROLE_LABELS[user.role]],
    ["Member since", formatDate(user.created_at)],
  ];

  return (
    <div>
      {rows.map(([label, value]) => (
        <div className="kv" key={label}>
          <b>{label}</b>
          <span>{value}</span>
        </div>
      ))}
    </div>
  );
};

export default ProfileDetails;
