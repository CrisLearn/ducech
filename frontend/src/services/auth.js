import { useState, useEffect, useContext, createContext } from 'react';
import axios from 'axios';

const authContext = createContext();

export const ProvideAuth = ({ children }) => {
  const auth = useProvideAuth();
  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
};

export const useAuth = () => {
  return useContext(authContext);
};

const useProvideAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);

  const login = async (email, password, role) => {
    try {
      let url;
      switch (role) {
        case 'admin':
          url = 'http://localhost:5000/api/admin/login-admin';
          break;
        case 'tecnico':
          url = 'http://localhost:5000/api/tecnico/login-tecnico';
          break;
        case 'cliente':
          url = 'http://localhost:5000/api/cliente/login-cliente';
          break;
        default:
          throw new Error('Invalid role');
      }

      const response = await axios.post(url, { email, password });
      setIsAuthenticated(true);
      setRole(role);
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      setIsAuthenticated(false);
      setRole(null);
      setUser(null);
      throw error;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setRole(null);
    setUser(null);
  };

  return {
    isAuthenticated,
    role,
    user,
    login,
    logout
  };
};
