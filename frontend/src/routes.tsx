import { createBrowserRouter } from "react-router-dom";
import App from "./App"; // This is your main landing page
import GPAiToolsPage from "./pages/GPAiToolsPage"; // This is your new tools page

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // The landing page component
  },
  {
    path: "/gpai-tools", // A separate route for the tools page
    element: <GPAiToolsPage />,
  },
]);

export default router;
