import { createBrowserRouter } from "react-router-dom";
import Root from "./layouts/Root";
import NonAuth from "./layouts/NonAuth";
import Auth from "./layouts/Auth";
import Dashboard from "./layouts/Dashboard";
import Login from "./pages/non_auth/login";
import ProtectedRoute from "./components/shared/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        path: "dashboard",
        element: (
          <ProtectedRoute requireAuth={true}>
            <Auth />
          </ProtectedRoute>
        ),
        children: [
          {
            path: "",
            element: <Dashboard />,
          },
        ],
      },
      {
        path: "non-auth",
        element: (
          <ProtectedRoute requireAuth={false}>
            <NonAuth />
          </ProtectedRoute>
        ),
        children: [
          {
            path: "login",
            element: <Login />,
          },
        ],
      },
    ],
  },
]);