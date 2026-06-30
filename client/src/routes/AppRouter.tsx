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

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route path="/signup" element={<SignupPage />} />

        <Route path="/dashboard" element={<DashboardPage />} />

        <Route path="/projects" element={<ProjectsPage />} />

        <Route
          path="/projects/:projectId"
          element={<ProjectDetailsPage />}
        />

        <Route
          path="/tasks/:taskId"
          element={<TaskDetailsPage />}
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