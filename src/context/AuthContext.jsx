import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('wajibabsen_token') || null);
  const [rolesList, setRolesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load user from backend if token exists or fetch roles
  useEffect(() => {
    fetch('http://localhost:5001/api/auth/roles')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRolesList(data.users);
          // Default to Employee if no user logged in
          const savedUser = localStorage.getItem('wajibabsen_user');
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          } else if (data.users.length > 0) {
            const defaultEmp = data.users.find(u => u.role === 'EMPLOYEE') || data.users[0];
            loginWithUser(defaultEmp);
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('API Server not ready or fetch error:', err);
        setLoading(false);
      });
  }, []);

  const loginWithUser = (userData, jwtToken = 'demo-jwt-token') => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('wajibabsen_user', JSON.stringify(userData));
    localStorage.setItem('wajibabsen_token', jwtToken);
  };

  const switchRole = async (targetRole) => {
    try {
      const res = await fetch('http://localhost:5001/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetRole })
      });
      const data = await res.json();
      if (data.success) {
        loginWithUser(data.user, data.token);
        return true;
      }
    } catch (err) {
      console.error('Error switching role:', err);
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('wajibabsen_user');
    localStorage.removeItem('wajibabsen_token');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      rolesList,
      loading,
      loginWithUser,
      switchRole,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
