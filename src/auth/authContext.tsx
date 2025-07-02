import   React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import   { useNavigate } from 'react-router-dom';
import   { message } from 'antd';
import axiosInstance from '../api/axiosInstance';
import { HttpStatusCode } from 'axios';

interface AuthContextType {
    isAuthenticated: boolean;
    loggedInUserId: string | null;
    login: () => void; 
    logout: () => void;
    isLoadingAuth: boolean;
}

export const AuthContext = createContext<AuthContextType|null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);

    const checkSession = useCallback(async () => {
        setIsLoadingAuth(true);
        try {
            const response = await axiosInstance.get<{ id: string; }>(`/auth/identity`);
            setIsAuthenticated(true);
            setLoggedInUserId(response.data.id);
            
            // Navigate to home if currently on an auth-related page and session is active
            if (window.location.pathname === '/login' || window.location.pathname === '/create' || window.location.pathname === '/') {
                navigate('/home');
            }
        } catch (error: any) {
            console.error('Session check failed:', error.response?.data || error.message);
            if (error.response?.status === HttpStatusCode.Unauthorized) {
                setIsAuthenticated(false);
                setLoggedInUserId(null);
                
                // Redirect to login if not already on /create or /login
                if (window.location.pathname !== '/create' && window.location.pathname !== '/login') {
                    navigate('/login');
                }
            } else {
                message.error('Failed to verify session.');
            }
        } finally {
            setIsLoadingAuth(false);
        }
    }, [navigate]);

    // triggers a session re-check after a successful login attempt
    const login = useCallback(() => {
        checkSession();
    }, [checkSession]);

    const logout = useCallback(async () => {
        try {
            await axiosInstance.post('/auth/logout'); // Backend clears HttpOnly cookie
        } catch (error) {
            console.error('Error during backend logout:', error);
            message.error('Logout failed on server. Please try again.');
        } finally {
            setIsAuthenticated(false);
            setLoggedInUserId(null);
            message.info('Logged out successfully.');
            navigate('/login');
        }
    }, [navigate]);


    useEffect(() => {
        checkSession();
    }, [checkSession]); 

    const authContextValue: AuthContextType = {
        isAuthenticated,
        loggedInUserId,
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
    return context!;
};