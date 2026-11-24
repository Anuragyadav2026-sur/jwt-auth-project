
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      alert("Unable to logout. Please try again.");
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h1>Welcome, {user?.name}!</h1>

        <p>You have successfully logged in.</p>

        <div className="user-info">
          <p>
            <strong>Name:</strong> {user?.name}
          </p>

          <p>
            <strong>Email:</strong> {user?.email}
          </p>
        </div>

        <button onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
