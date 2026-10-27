import { Route, Routes } from "react-router-dom";
import GuestRoute from "./shared/components/routing/GuestRoute";
import ProtectedRoute from "./shared/components/routing/ProtectedRoute";
import HomeRedirect from "./shared/components/routing/HomeRedirect";
import RoleLayout from "./shared/components/layout/RoleLayout";
import NotFoundView from "./shared/views/NotFoundView";
import LoginView from "./features/auth/views/LoginView";
import RegisterView from "./features/auth/views/RegisterView";
import ProfileView from "./features/users/views/ProfileView";
import AdminUsersView from "./features/users/views/AdminUsersView";

function App() {
  return (
    <Routes>
      {/* only for visitors who are not logged in */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginView />} />
        <Route path="/register" element={<RegisterView />} />
      </Route>

      {/* everything below needs a logged-in user */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleLayout />}>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/profile" element={<ProfileView />} />

          {/* admin only */}
          <Route element={<ProtectedRoute roles={["admin"]} />}>
            <Route path="/admin/users" element={<AdminUsersView />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundView />} />
    </Routes>
  );
}

export default App;
