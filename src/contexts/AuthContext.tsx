import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'admin' | 'photographer' | 'user';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: UserRole;
  facialRecognitionRegistered?: boolean;
  business?: {
    name: string;
    phone: string;
    email: string;
    website: string;
    socialLinks: {
      instagram?: string;
      facebook?: string;
      twitter?: string;
      youtube?: string;
    };
    showInfo: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string) => void;
  signup: (data: SignupData) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  updateAvatar: (avatar: string, isLiveScan?: boolean) => void;
  loginWithPhone: (firebaseUser: any, phoneNumber: string) => void;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'photographer' | 'user';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('fabPhotoUser');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        // Migration: Change 'guest' to 'user'
        if (parsed.role === 'guest') {
          parsed.role = 'user';
          localStorage.setItem('fabPhotoUser', JSON.stringify(parsed));
        }
        return parsed;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const login = (email: string) => {
    // Check if user exists in registered users
    const registeredUsers = JSON.parse(localStorage.getItem('fabPhotoRegisteredUsers') || '[]');
    const existingUser = registeredUsers.find((u: any) => u.email === email);
    
    if (existingUser) {
      // User exists, load their data
      setUser(existingUser);
      localStorage.setItem('fabPhotoUser', JSON.stringify(existingUser));
    } else {
      // User doesn't exist, create temporary user (will need to register)
      const newUser: User = {
        id: '1',
        firstName: 'Rahul',
        lastName: 'Sharma',
        name: 'Rahul Sharma',
        email: email,
        phone: '+91 98765 43210',
        avatar: 'RS',
        role: 'photographer',
      };
      setUser(newUser);
      localStorage.setItem('fabPhotoUser', JSON.stringify(newUser));
    }
    localStorage.setItem('fabPhotoToken', 'mock-token-12345');
  };

  const signup = (data: SignupData) => {
    const newUser: User = {
      id: '1',
      firstName: data.firstName,
      lastName: data.lastName,
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      phone: data.phone,
      avatar: `${data.firstName[0]}${data.lastName[0]}`.toUpperCase(),
      role: data.role,
    };
    setUser(newUser);
    localStorage.setItem('fabPhotoUser', JSON.stringify(newUser));
    localStorage.setItem('fabPhotoToken', 'mock-token-12345');
    
    // Save to registered users list
    const registeredUsers = JSON.parse(localStorage.getItem('fabPhotoRegisteredUsers') || '[]');
    const existingIndex = registeredUsers.findIndex((u: any) => u.email === data.email);
    
    if (existingIndex >= 0) {
      // Update existing user
      registeredUsers[existingIndex] = newUser;
    } else {
      // Add new user
      registeredUsers.push(newUser);
    }
    
    localStorage.setItem('fabPhotoRegisteredUsers', JSON.stringify(registeredUsers));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("fabPhotoToken");
    localStorage.removeItem("fabPhotoUser");
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    const permissions: Record<UserRole, string[]> = {
      admin: [
        'create_group', 'delete_group', 'upload_photos', 'delete_photos',
        'manage_team', 'view_analytics', 'manage_branding', 'manage_watermark',
        'manage_portfolio', 'manage_wallet', 'view_transactions', 'manage_settings',
        'select_photos', 'transfer_photos', 'download_photos', 'favorite_photos',
      ],
      photographer: [
        'create_group', 'upload_photos', 'delete_photos', 'manage_team',
        'view_analytics', 'manage_branding', 'manage_watermark', 'manage_portfolio',
        'manage_wallet', 'view_transactions', 'manage_settings',
        'select_photos', 'transfer_photos', 'download_photos', 'favorite_photos',
      ],
      user: [
        'create_group', 'download_photos', 'favorite_photos', 'select_photos',
      ],
    };
    return permissions[user.role]?.includes(permission) ?? false;
  };

  const updateAvatar = (avatar: string, isLiveScan: boolean = false) => {
    if (!user) return;
    const updatedUser: User = { 
      ...user, 
      avatar,
      facialRecognitionRegistered: isLiveScan || user.facialRecognitionRegistered 
    };
    setUser(updatedUser);
    localStorage.setItem('fabPhotoUser', JSON.stringify(updatedUser));
    
    // Update in registered users list
    const registeredUsers = JSON.parse(localStorage.getItem('fabPhotoRegisteredUsers') || '[]');
    const existingIndex = registeredUsers.findIndex((u: any) => u.email === user.email);
    if (existingIndex >= 0) {
      registeredUsers[existingIndex] = updatedUser;
      localStorage.setItem('fabPhotoRegisteredUsers', JSON.stringify(registeredUsers));
    }
  };

  const loginWithPhone = (firebaseUser: any, phoneNumber: string) => {
    // Check if user exists in registered users by phone
    const registeredUsers = JSON.parse(localStorage.getItem('fabPhotoRegisteredUsers') || '[]');
    let existingUser = registeredUsers.find((u: any) => u.phone === phoneNumber);
    
    if (existingUser) {
      // User exists, load their data
      setUser(existingUser);
      localStorage.setItem('fabPhotoUser', JSON.stringify(existingUser));
    } else {
      // User doesn't exist, create new user with phone
      const newUser: User = {
        id: firebaseUser.uid || Date.now().toString(),
        firstName: 'User',
        lastName: phoneNumber.slice(-4), // Last 4 digits as placeholder
        name: `User ${phoneNumber.slice(-4)}`,
        email: firebaseUser.email || `user${phoneNumber.slice(-4)}@photofab.com`,
        phone: phoneNumber,
        avatar: 'U',
        role: 'user',
      };
      setUser(newUser);
      localStorage.setItem('fabPhotoUser', JSON.stringify(newUser));
      
      // Save to registered users list
      registeredUsers.push(newUser);
      localStorage.setItem('fabPhotoRegisteredUsers', JSON.stringify(registeredUsers));
    }
    localStorage.setItem('fabPhotoToken', firebaseUser.accessToken || 'phone-auth-token');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout, hasPermission, updateAvatar, loginWithPhone }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
