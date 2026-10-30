import Avatar from "../../../shared/components/ui/Avatar";
import Badge from "../../../shared/components/ui/Badge";
import Button from "../../../shared/components/ui/Button";
import { ROLE_COLORS, ROLE_LABELS, ROLES } from "../../../shared/config/roles";
import { formatDate, getFullName } from "../../../shared/utils/format";

/**
 * Admin table of users. The role can be changed inline with the select.
 * The logged-in admin cannot change or delete their own account.
 * "Reset 2FA" helps a user who lost their phone and their backup codes.
 */
const UsersTable = ({
  users,
  currentUserId,
  busyUserId,
  onRoleChange,
  onResetTwoFactor,
  onDelete,
}) => {
  return (
    <div className="card table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>User</th>
            <th>Role</th>
            <th>2FA</th>
            <th>Joined</th>
            <th className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isMe = user.id === currentUserId;
            const busy = busyUserId === user.id;

            return (
              <tr key={user.id}>
                <td>
                  <div className="user-cell">
                    <Avatar user={user} />
                    <div>
                      <div className="name-cell">
                        {getFullName(user)}{" "}
                        {isMe && <span className="small">(you)</span>}
                      </div>
                      <div className="small">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  {isMe ? (
                    <Badge color={ROLE_COLORS[user.role]}>
                      {ROLE_LABELS[user.role]}
                    </Badge>
                  ) : (
                    <select
                      className="select select-inline"
                      value={user.role}
                      disabled={busy}
                      onChange={(event) =>
                        onRoleChange(user, event.target.value)
                      }
                      aria-label={`Role of ${getFullName(user)}`}
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role}>
                          {ROLE_LABELS[role]}
                        </option>
                      ))}
                    </select>
                  )}
                </td>
                <td>
                  <Badge color={user.two_factor_enabled ? "green" : "slate"}>
                    {user.two_factor_enabled ? "On" : "Off"}
                  </Badge>
                </td>
                <td>{formatDate(user.created_at)}</td>
                <td className="text-end">
                  <div className="table-actions">
                    {user.two_factor_enabled && !isMe && (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={busy}
                        onClick={() => onResetTwoFactor(user)}
                      >
                        Reset 2FA
                      </Button>
                    )}
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={isMe || busy}
                      onClick={() => onDelete(user)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;
