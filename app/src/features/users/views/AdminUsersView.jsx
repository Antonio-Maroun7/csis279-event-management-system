import { useCallback, useState } from "react";
import useAuth from "../../auth/context/useAuth";
import useDebounce from "../../../shared/hooks/useDebounce";
import useFetch from "../../../shared/hooks/useFetch";
import Alert from "../../../shared/components/ui/Alert";
import ConfirmModal from "../../../shared/components/ui/ConfirmModal";
import EmptyState from "../../../shared/components/ui/EmptyState";
import PageHeader from "../../../shared/components/ui/PageHeader";
import Pagination from "../../../shared/components/ui/Pagination";
import Spinner from "../../../shared/components/ui/Spinner";
import StatCard from "../../../shared/components/ui/StatCard";
import { ROLE_LABELS } from "../../../shared/config/roles";
import { getFullName } from "../../../shared/utils/format";
import UserFilters from "../components/UserFilters";
import UsersTable from "../components/UsersTable";
import { changeUserRole, deleteUser, getUsers } from "../services/userService";

const PAGE_SIZE = 8;

const AdminUsersView = () => {
  const { user: currentUser } = useAuth();

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search.trim());

  const [success, setSuccess] = useState("");
  const [busyUserId, setBusyUserId] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // a new function = new filters = useFetch loads the list again
  const fetchUsers = useCallback(
    () => getUsers({ search: debouncedSearch, role, page, limit: PAGE_SIZE }),
    [debouncedSearch, role, page],
  );
  const { data, loading, error, setError, reload } = useFetch(fetchUsers);

  const users = data?.users ?? [];
  const counts = data?.counts ?? {
    total: 0,
    attendee: 0,
    organizer: 0,
    admin: 0,
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleRoleFilterChange = (value) => {
    setRole(value);
    setPage(1);
  };

  const handleRoleChange = async (user, newRole) => {
    try {
      setBusyUserId(user.id);
      setError("");
      setSuccess("");
      await changeUserRole(user.id, newRole);
      setSuccess(
        `${getFullName(user)} is now ${ROLE_LABELS[newRole]}. The change applies at their next sign-in.`,
      );
      await reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyUserId(null);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true);
      setError("");
      setSuccess("");
      await deleteUser(userToDelete.id);
      setSuccess(`${getFullName(userToDelete)} was deleted.`);

      // deleting the last user of a page goes back one page
      if (users.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        await reload();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
      setUserToDelete(null);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="SYSTEM ADMINISTRATION"
        title="User management"
        subtitle="Promote organizers, review accounts and remove inactive users."
      />

      <div className="grid grid-4">
        <StatCard
          label="Users"
          value={counts.total}
          icon="◎"
          hint="Across all roles"
        />
        <StatCard
          label="Attendees"
          value={counts.attendee}
          icon="◉"
          hint="Join events"
        />
        <StatCard
          label="Organizers"
          value={counts.organizer}
          icon="▦"
          hint="Create events"
        />
        <StatCard
          label="Administrators"
          value={counts.admin}
          icon="✦"
          hint="Manage the platform"
        />
      </div>

      <div className="section-head mt-4">
        <div>
          <h2 className="section-title">All users</h2>
          <p className="subtitle">
            Change a role from the list. Organizers can create events.
          </p>
        </div>
        <UserFilters
          search={search}
          role={role}
          onSearchChange={handleSearchChange}
          onRoleChange={handleRoleFilterChange}
        />
      </div>

      <Alert variant="danger" onClose={() => setError("")} className="mb-3">
        {error}
      </Alert>
      <Alert variant="success" onClose={() => setSuccess("")} className="mb-3">
        {success}
      </Alert>

      {loading ? (
        <div className="card">
          <Spinner label="Loading users..." />
        </div>
      ) : users.length === 0 ? (
        <div className="card">
          <EmptyState
            icon="◎"
            title="No users found"
            text="Try another name, email or role filter."
          />
        </div>
      ) : (
        <>
          <UsersTable
            users={users}
            currentUserId={currentUser.id}
            busyUserId={busyUserId}
            onRoleChange={handleRoleChange}
            onDelete={setUserToDelete}
          />
          <Pagination
            page={data.page}
            totalPages={data.total_pages}
            total={data.total}
            onPageChange={setPage}
          />
        </>
      )}

      <ConfirmModal
        show={Boolean(userToDelete)}
        title="Delete this user?"
        message={
          userToDelete &&
          `${getFullName(userToDelete)} (${userToDelete.email}) will be removed permanently. Users with events or registrations cannot be deleted.`
        }
        confirmLabel="Delete user"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setUserToDelete(null)}
      />
    </>
  );
};

export default AdminUsersView;
