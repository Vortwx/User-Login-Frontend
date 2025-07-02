import React, { useState, useEffect, createContext, useContext } from 'react';
import { Layout, Form, Input, Button, Card, Space, Typography, message, Spin } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined, CodeOutlined } from '@ant-design/icons';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { CookiesProvider, useCookies } from 'react-cookie'; // For cookie management
import { useJwt } from 'react-jwt'
import axiosInstance from '../api/axiosInstance';

interface AuthContextType {
    isAuthenticated: boolean;
    loggedInUserId: string | null;
    currentUserUsername: string | null;
    login: (token: string) => void; 
    logout: () => void;
    isLoadingAuth: boolean;
}

export const AuthContext = createContext<AuthContextType|null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const authTokenKey = 'session_token';
    const [cookies, setCookie, removeCookie] = useCookies([authTokenKey]);
  
    // The sessionToken is now read directly from the cookie
    const sessionTokenFromCookie = cookies[authTokenKey];
    const { decodedToken, isExpired } = useJwt(sessionTokenFromCookie || ''); // Decode from cookie value
    
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  
    // Derived state from decoded token
    const isAuthenticated = !!sessionTokenFromCookie && !isExpired; // Check cookie existence and expiry
    const loggedInUserId = (decodedToken as any)?.sub || null;
    const currentUserUsername = (decodedToken as any)?.username || null;
  
    // Function to set the access token in a cookie
    const login = (token: string) => {
      // Set the JWT (access_token) in a client-side cookie
      // This is distinct from the HttpOnly session cookie set by the backend.
      setCookie(authTokenKey, token, { path: '/', maxAge: 3600 }); // Expires in 1 hour
    };
  
    // Function to clear authentication state (for logout)
    const logout = async () => {
      removeCookie(authTokenKey, { path: '/' }); // Remove the client-side JWT cookie
      message.info('Logged out successfully.');
      navigate('/login');
    };
  
    // Effect to handle navigation based on authentication status
    useEffect(() => {
      setIsLoadingAuth(true);
      if (isAuthenticated) {
        navigate('/home');
        message.success(`Welcome back, ${currentUserUsername}!`);
      } else {
        // Only redirect to login if not already on /create or /login
        if (window.location.pathname !== '/create' && window.location.pathname !== '/login') {
          navigate('/login');
        }
      }
      setIsLoadingAuth(false);
    }, [isAuthenticated, navigate, currentUserUsername]); // Depend on isAuthenticated and navigate
  
    const authContextValue: AuthContextType = {
      isAuthenticated,
      loggedInUserId,
      currentUserUsername,
      login,
      logout,
      isLoadingAuth,
    };
  
    return (
      <AuthContext.Provider value={authContextValue}>
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