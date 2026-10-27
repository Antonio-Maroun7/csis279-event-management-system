import { useState } from "react";
import useAuth from "../../auth/context/useAuth";
import Alert from "../../../shared/components/ui/Alert";
import PageHeader from "../../../shared/components/ui/PageHeader";
import ProfileHeader from "../components/ProfileHeader";
import ProfileDetails from "../components/ProfileDetails";
import ProfileForm from "../components/ProfileForm";
import SecurityCard from "../components/SecurityCard";
import ChangePasswordModal from "../components/ChangePasswordModal";
import { changeMyPassword, updateMyProfile } from "../services/userService";

const ProfileView = () => {
  const { user, updateUser } = useAuth(); // Get the current user and update function from auth context
  const [editing, setEditing] = useState(false); // Track whether the profile is in edit mode
  const [showPasswordModal, setShowPasswordModal] = useState(false); // Track whether the change password modal is visible
  const [success, setSuccess] = useState(""); // Track the success message to display after profile or password updates

  const handleSaveProfile = async ({ first_name, last_name }) => {
    const updated = await updateMyProfile({
      first_name: first_name.trim(),
      last_name: last_name.trim(),
    });
    updateUser(updated);
    setEditing(false);
    setSuccess("Your profile was updated.");
  };

  const handleChangePassword = async (values) => {
    await changeMyPassword({
      current_password: values.current_password,
      new_password: values.new_password,
    });
    setShowPasswordModal(false);
    setSuccess("Your password was changed.");
  };

  return (
    <div className="page-narrow">
      <PageHeader
        eyebrow="ACCOUNT"
        title="Profile & preferences"
        subtitle="Review your account information and security settings."
      />

      <Alert variant="success" onClose={() => setSuccess("")} className="mb-3">
        {success}
      </Alert>

      <ProfileHeader
        user={user}
        editing={editing}
        onEdit={() => {
          setSuccess("");
          setEditing(true);
        }}
      />

      <div className="grid grid-2 mt-4">
        <section className="card card-pad">
          <div className="eyebrow">
            {editing ? "EDIT PROFILE" : "PERSONAL INFORMATION"}
          </div>
          {editing ? (
            <ProfileForm
              user={user}
              onSave={handleSaveProfile}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <ProfileDetails user={user} />
          )}
        </section>

        <SecurityCard
          user={user}
          onChangePassword={() => {
            setSuccess("");
            setShowPasswordModal(true);
          }}
        />
      </div>

      <ChangePasswordModal
        show={showPasswordModal}
        onSubmit={handleChangePassword}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  );
};

export default ProfileView;
