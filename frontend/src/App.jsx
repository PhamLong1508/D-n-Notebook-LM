import { Routes, Route, Navigate } from "react-router-dom";
import { ContextPanelProvider } from "./contexts/ContextPanelContext";
import AuthLayout from "./layouts/AuthLayout";
import MainLayout from "./layouts/MainLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import NotebooksPage from "./pages/NotebooksPage";
import NotebookDetailPage from "./pages/NotebookDetailPage";
import AdminPage from "./pages/AdminPage";
import ProfilePage from "./pages/ProfilePage";
import "./App.css";

function App() {
  return (
    <ContextPanelProvider>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/notebooks" element={<NotebooksPage />} />
          <Route path="/notebooks/:id" element={<NotebookDetailPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          {/* Backward compatibility */}
          <Route path="/notes" element={<Navigate to="/notebooks" />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </ContextPanelProvider>
  );
}

export default App;
