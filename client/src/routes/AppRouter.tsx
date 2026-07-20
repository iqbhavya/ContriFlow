import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import LoginPage from "../pages/auth/LoginPage";
import SignupPage from "../pages/auth/SignupPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import ProjectsPage from "../pages/project/ProjectsPage";
import ProjectDetailsPage from "../pages/project/ProjectDetailsPage";
import TaskDetailsPage from "../pages/task/TaskDetailsPage";
import ContributionPage from "../pages/contribution/ContributionPage";
import ProtectedRoute from "./ProtectedRoute";


function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/signup" element={<SignupPage />} />

        <Route
            path="/dashboard"
            element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
            }
            />

        <Route path="/projects" element={
          <ProtectedRoute>
            <ProjectsPage />
          </ProtectedRoute>
          
          } />

        <Route
          path="/projects/:projectId"
          element={
          <ProtectedRoute>
            <ProjectDetailsPage />
          </ProtectedRoute>
          }
        />

        <Route
          path="/tasks/:taskId"
          element={
            <ProtectedRoute>
              <TaskDetailsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/contributions/:contributionId"
          element={<ContributionPage />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;