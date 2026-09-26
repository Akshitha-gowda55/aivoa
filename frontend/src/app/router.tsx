import { Navigate, createBrowserRouter } from "react-router-dom";
import { App } from "@/app/App";
import { DashboardPage } from "@/pages/DashboardPage";
import { DeviationDetailsPage } from "@/pages/DeviationDetailsPage";
import { DeviationsPage } from "@/pages/DeviationsPage";
import { LogDeviationPage } from "@/pages/LogDeviationPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "deviations", element: <DeviationsPage /> },
      { path: "deviations/new", element: <LogDeviationPage /> },
      { path: "deviations/:id", element: <DeviationDetailsPage /> },
    ],
  },
]);
