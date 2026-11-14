import { Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ChatPage } from "./pages/ChatPage";
import { SettingsShell } from "./components/settings/settings-shell";
import { SettingsHub } from "./pages/settings/SettingsHub";
import { SettingsAccountPage } from "./pages/settings/SettingsAccountPage";
import { SettingsProfilePage } from "./pages/settings/SettingsProfilePage";
import { SettingsPersonalizationPage } from "./pages/settings/SettingsPersonalizationPage";
import { SettingsBillingPage } from "./pages/settings/SettingsBillingPage";
import { SettingsDeveloperPage } from "./pages/settings/SettingsDeveloperPage";
import { SettingsSupportPage } from "./pages/settings/SettingsSupportPage";
import { SettingsAboutPage } from "./pages/settings/SettingsAboutPage";
import { SettingsAdminOverviewPage } from "./pages/settings/admin/SettingsAdminOverviewPage";
import { SettingsAdminUsersPage } from "./pages/settings/admin/SettingsAdminUsersPage";
import { SettingsAdminUserDetailPage } from "./pages/settings/admin/SettingsAdminUserDetailPage";
import { SettingsAdminRequestsPage } from "./pages/settings/admin/SettingsAdminRequestsPage";
import { SettingsAdminModelsPage } from "./pages/settings/admin/SettingsAdminModelsPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/settings" element={<SettingsShell />}>
        <Route index element={<SettingsHub />} />
        <Route path="account" element={<SettingsAccountPage />} />
        <Route path="profile" element={<SettingsProfilePage />} />
        <Route path="personalization" element={<SettingsPersonalizationPage />} />
        <Route path="billing" element={<SettingsBillingPage />} />
        <Route path="developer" element={<SettingsDeveloperPage />} />
        <Route path="support" element={<SettingsSupportPage />} />
        <Route path="about" element={<SettingsAboutPage />} />
        <Route path="admin" element={<SettingsAdminOverviewPage />} />
        <Route path="admin/users" element={<SettingsAdminUsersPage />} />
        <Route path="admin/users/:userId" element={<SettingsAdminUserDetailPage />} />
        <Route path="admin/requests" element={<SettingsAdminRequestsPage />} />
        <Route path="admin/models" element={<SettingsAdminModelsPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}