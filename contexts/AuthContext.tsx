import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, PointReason } from '../types';
import { db } from '../services/db';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<User>) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      await db.init();
      const storedUserId = localStorage.getItem('nhc_session_uid');
      if (storedUserId) {
        // In a real app we would verify a token. Here we simulate fetching the user.
        // We use a private helper or just filter from db (which is accessible)
        // Since db methods are async, we rely on db.getUser(which we need to add, or filter)
        // Let's implement a simple direct fetch for session restoration
        const allUsers = JSON.parse(localStorage.getItem('nhc_users') || '[]');
        const foundUser = allUsers.find((u: User) => u.id === storedUserId);
        
        if (foundUser) {
           setUser(foundUser);
           // Daily login bonus check
           const lastLogin = foundUser.last_login;
           const today = new Date().toDateString();
           if (lastLogin !== today) {
             await db.awardPoints(foundUser.id, 5, PointReason.DAILY_LOGIN);
             await db.updateUser(foundUser.id, { last_login: today });
             // Refresh user state
             setUser({ ...foundUser, hemp_points: foundUser.hemp_points + 5, last_login: today });
           }
        } else {
          localStorage.removeItem('nhc_session_uid');
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    // Simulate password check (in real app, compare hash)
    const userFound = await db.getUserByEmail(email);
    
    if (userFound && userFound.password_hash === password) { // Simple check for simulation
      setUser(userFound);
      localStorage.setItem('nhc_session_uid', userFound.id);
      
      // Daily login bonus for manual login too
      const today = new Date().toDateString();
       if (userFound.last_login !== today) {
         await db.awardPoints(userFound.id, 5, PointReason.DAILY_LOGIN);
         await db.updateUser(userFound.id, { last_login: today });
         setUser({ ...userFound, hemp_points: userFound.hemp_points + 5, last_login: today });
       }
    } else {
      setIsLoading(false);
      throw new Error('Invalid email or password');
    }
    setIsLoading(false);
  };

  const register = async (userData: Partial<User>) => {
    setIsLoading(true);
    try {
      const newUser = await db.createUser(userData);
      setUser(newUser);
      localStorage.setItem('nhc_session_uid', newUser.id);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nhc_session_uid');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
