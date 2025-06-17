import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";

import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = () => {
  const { setToken } = useContext(AuthContext);
  const token = localStorage.getItem("token");
  console.log(token);
  if (token) {
    setToken(token);
  }
  return token ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
