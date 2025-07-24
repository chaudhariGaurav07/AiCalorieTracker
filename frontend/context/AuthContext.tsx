import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
  _id: string;
  email: string;
  username: string;
}

interface GoalInput {
  gender: "male" | "female";
  age: number;
  height: number;
  weight: number;
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very active";
  goalType: "maintain" | "gain" | "loss";
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  token: string | null;
  hasGoal: boolean;
  login: (email: string, password: string) => Promise<boolean>; 
  register: (
    email: string,
    username: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  setGoal: (goal: GoalInput) => Promise<void>;
  checkGoal: () => Promise<boolean>; // Optional fix to match usage
  loading: boolean;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

const API_BASE = "https://aicalorietracker.onrender.com/api/v1/users";
const GOAL_API = "https://aicalorietracker.onrender.com/api/v1/goals";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [hasGoal, setHasGoal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("auth_token");
        const storedUser = await AsyncStorage.getItem("user");
        const storedHasGoal = await AsyncStorage.getItem("has_goal");

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setHasGoal(storedHasGoal === "true");
        }
      } catch (error) {
        console.error("Error loading stored auth:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");
  
    const { accessToken, user: userData } = data.data;
  
    setToken(accessToken);
    setUser(userData);
  
    await AsyncStorage.setItem("auth_token", accessToken);
    await AsyncStorage.setItem("user", JSON.stringify(userData));
  
    const goalStatus = await checkGoal(accessToken); // ← await and return boolean
    return goalStatus;
  };
  

  const register = async (
    email: string,
    username: string,
    password: string
  ) => {
    const res = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Registration failed");

    const { accessToken, user: userData } = data.data;

    setToken(accessToken);
    setUser(userData);
    setHasGoal(false);

    await AsyncStorage.setItem("auth_token", accessToken);
    await AsyncStorage.setItem("user", JSON.stringify(userData));
    await AsyncStorage.setItem("has_goal", "false");
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.warn("Logout request failed. Clearing local data anyway.");
    } finally {
      setUser(null);
      setToken(null);
      setHasGoal(false);
      await AsyncStorage.multiRemove([
        "auth_token",
        "user",
        "has_goal",
        "goal_prompted_once", //  clear this too
      ]);
    }
  };

  const setGoal = async (goal: GoalInput) => {
    if (!token) {
      console.warn(" No token found — forcing logout");
      await logout();
      return;
    }
  
    const res = await fetch(`${GOAL_API}/set`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(goal),
    });
  
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to set goal");
  
    setHasGoal(true);
    await AsyncStorage.setItem("has_goal", "true");
    await AsyncStorage.setItem("goal_prompted_once", "true"); // mark as prompted
  };
  

  const checkGoal = async (accessToken?: string): Promise<boolean> => {
    const authToken = accessToken || token;
  
    if (!authToken) {
      console.warn(" No token found — forcing logout");
      await logout();
      return false;
    }
  
    try {
      const res = await fetch(`${GOAL_API}/get`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
  
      const data = await res.json();
      const goalExists = res.ok && !!data?.data?.targetCalories;
  
      setHasGoal(goalExists);
      await AsyncStorage.setItem("has_goal", goalExists ? "true" : "false");
  
      return goalExists;
    } catch {
      setHasGoal(false);
      await AsyncStorage.setItem("has_goal", "false");
      return false;
    }
  };
  
  

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        hasGoal,
        login,
        register,
        logout,
        setGoal,
        checkGoal,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
