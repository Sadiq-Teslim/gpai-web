import { createBrowserRouter } from "react-router-dom";
import App from "./App"; // This is your main landing page
import GPAiToolsPage from "./pages/GPAiToolsPage"; // This is your new tools page
import UnsubscribePage from "./pages/UnsubscribePage";
import AdminLoginPage from "./pages/AdminLoginPage";   // <-- Import new page
import AdminDashboardPage from "./pages/AdminDashboardPage"; // <-- Import new page
import ProtectedRoute from "./components/admin/ProtectedRoute"; 

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // The landing page component
  },
  {
    path: "/gpai-tools", // A separate route for the tools page
    element: <GPAiToolsPage />,
  },
  {
    path: "/unsubscribe", // <-- Add the new route
    element: <UnsubscribePage />,
  },
  {
    path: "/admin/login", // The public-facing login page
    element: <AdminLoginPage />,
  },
  {
    path: "/admin/dashboard", // The protected dashboard
    element: (
      <ProtectedRoute>
        <AdminDashboardPage />
      </ProtectedRoute>
    ),
  },
]);

export default router;
