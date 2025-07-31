import { Navigate, Outlet } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { authState } from "../utils/PrivateRoute";

const PublicRoute: React.FC = () => {
  const isAuthenticated = useRecoilValue(authState);

  return isAuthenticated ? <Navigate to="/admin/dashboard" replace /> : <Outlet />;
};

export default PublicRoute;
