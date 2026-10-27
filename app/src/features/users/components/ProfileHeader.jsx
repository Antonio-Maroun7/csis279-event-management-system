import Avatar from "../../../shared/components/ui/Avatar";
import Badge from "../../../shared/components/ui/Badge";
import Button from "../../../shared/components/ui/Button";
import { ROLE_COLORS, ROLE_LABELS } from "../../../shared/config/roles";
import { getFullName } from "../../../shared/utils/format";

/**
 * Top card of the profile page: avatar, name, email, role and the edit button.
 */
const ProfileHeader = ({ user, editing, onEdit }) => {
  return (
    <section className="card card-pad">
      <div className="profile-head">
        <Avatar user={user} size="lg" />
        <div>
          <h2 className="profile-name">{getFullName(user)}</h2>
          <div className="small mt-1">{user.email}</div>
          <div className="mt-2">
            <Badge color={ROLE_COLORS[user.role]}>
              {ROLE_LABELS[user.role]}
            </Badge>
          </div>
        </div>
        {!editing && <Button onClick={onEdit}>Edit profile</Button>}
      </div>
    </section>
  );
};

export default ProfileHeader;
