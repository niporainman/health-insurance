import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";

export default function Dashboard() {
  const { role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (role === "user") navigate("/user");
    else if (role === "hp") navigate("/hp");
    else if (role === "hmo") navigate("/hmo");
    else if (role === "admin") navigate("/admin");
  }, [role]);

  return <div>Loading dashboard...</div>;
}