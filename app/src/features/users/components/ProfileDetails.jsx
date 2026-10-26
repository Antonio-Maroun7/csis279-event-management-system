import { ROLE_LABELS } from "../../../shared/config/roles";
import { formatDate } from "../../../shared/utils/format";

const ProfileDetails = ({ user }) => {
  const rows = [
    ["First Name", user.firstName],
    ["Last Name", user.lastName],
    ["Email", user.email],
    ["Role", ROLE_LABELS[user.role]],
    ["Member Since", formatDate(user.createdAt)],
  ];

  return (
    <div>
      {rows.map(([label, value]) => (
        <div key={label}>
          <b>{label}</b>
          <span> {value}</span>
        </div>
      ))}
    </div>
  );
};
