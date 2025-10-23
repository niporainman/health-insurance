// components/RequireRole.js
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const RequireRole = ({ allowedRoles, redirectTo = "/" , children }) => {
  const { currentUser, role } = useAuth();

  if (!currentUser) {
    return <Navigate to={redirectTo} replace />;
  }

  if (!currentUser || role === null) {
  return <div className="text-center p-4">Loading...</div>;
}


  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RequireRole;
