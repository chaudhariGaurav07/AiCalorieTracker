import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  _id: string;
  email: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  hasGoal: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (email: string, username: string) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

const API = 'https://aicalorietracker.onrender.com/api/v1/users';
const API_BASE_URL = 'https://aicalorietracker.onrender.com/api/v1';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [hasGoal, setHasGoal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('access_token');
        const storedUser = await AsyncStorage.getItem('user');
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          await checkGoal(storedToken);
        }
      } catch (err) {
        console.error('Error loading auth data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStoredAuth();
  }, []);

  const checkGoal = async (accessToken: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/goals/get`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await res.json();
      setHasGoal(!!data?.calories); // check if calories is set
    } catch (err) {
      setHasGoal(false);
    }
  };

  const login = async (identifier: string, password: string) => {
    const res = await fetch(`${API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: identifier, email: identifier, password }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Login failed');

    const { accessToken, user: userData } = json.data;
    await AsyncStorage.setItem('access_token', accessToken);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    setToken(accessToken);
    setUser(userData);
    await checkGoal(accessToken);
  };

  const register = async (email: string, username: string, password: string) => {
    const res = await fetch(`${API}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
  };

  const logout = async () => {
    try {
      await fetch(`${API}/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (e) {
      console.warn('Logout failed on server:', e);
    } finally {
      await AsyncStorage.multiRemove(['access_token', 'user']);
      setToken(null);
      setUser(null);
      setHasGoal(false);
    }
  };

  const updateProfile = async (email: string, username: string) => {
    const res = await fetch(`${API}/update-account`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email, username }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update profile');
    setUser(data.data);
    await AsyncStorage.setItem('user', JSON.stringify(data.data));
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    const res = await fetch(`${API}/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to change password');
  };

  const forgotPassword = async (email: string) => {
    const res = await fetch(`${API}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to send reset email');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        hasGoal,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        forgotPassword,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
