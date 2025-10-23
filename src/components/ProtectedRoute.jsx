// components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth} from "../services/firebase";

const ProtectedRoute = ({ children, redirect }) => {
  const [user, loading] = useAuthState(auth);

  if (loading) return <div>Loading...</div>;

  return user ? children : <Navigate to={redirect} />;
};

export default ProtectedRoute;
