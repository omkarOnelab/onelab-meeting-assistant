import { createBrowserRouter, Navigate } from "react-router-dom";
import Root from "./layouts/Root";
import NonAuth from "./layouts/NonAuth";
import Login from "./pages/non_auth/login";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import Dashboard from "./pages/auth/dashboard/Dashboard";
import DashboardHome from "./pages/auth/dashboard/DashboardHome";
import Meetings from "./pages/auth/dashboard/Meetings";
import MeetingDetail from "./pages/auth/dashboard/MeetingDetails";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        path: "auth",
        element: (
          <ProtectedRoute requireAuth={true}>
            <Dashboard />
          </ProtectedRoute>
        ),
        children: [
          {
            path: "",
            element: <Navigate to="/auth/dashboard" replace />,
          },
          {
            path: "dashboard",
            element: <DashboardHome />,
          },
          {
            path: "meetings",
            element: <Meetings />,
          },
          {
            path: "meetings/:id",
            element: <MeetingDetail />,
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
      // Direct login route for testing
      {
        path: "login",
        element: <Login />,
      },
    ],
  },
]);