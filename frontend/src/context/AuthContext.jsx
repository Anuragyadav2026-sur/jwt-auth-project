
import { createContext, useContext, useEffect, useState } from "react";
import API from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check whether user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await API.get("/auth/me");
        setUser(response.data.user);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Register user
  const register = async (name, email, password) => {
    const response = await API.post("/auth/register", {
      name,
      email,
      password
    });

    setUser(response.data.user);

    return response.data;
  };

  // Login user
  const login = async (email, password) => {
    const response = await API.post("/auth/login", {
      email,
      password
    });

    setUser(response.data.user);

    return response.data;
  };

  // Logout user
  const logout = async () => {
    try {
      await API.post("/auth/logout");
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  return useContext(AuthContext);
};
