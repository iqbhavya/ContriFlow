import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import AppLayout from "../components/layout/AppLayout";

function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {

  const { token , authLoading  } = useAuth();

  if (authLoading) {
    return <h2>Loading...</h2>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout>{children}</AppLayout>;
}

export default ProtectedRoute;