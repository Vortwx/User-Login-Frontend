import React, { useState, useEffect } from 'react';
import { Layout, Button, Space, Typography, Spin, message, Card } from 'antd';
import { useAuth } from '../auth/authContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { User } from '../api/entity';
import { HttpStatusCode } from 'axios';
import '@ant-design/v5-patch-for-react-19';

const { Title } = Typography;

const HomePage: React.FC = () => {
    const auth = useAuth();
    const navigate = useNavigate();
    const [User, setUser] = useState<User | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            if (auth.isAuthenticated && auth.loggedInUserId) {
                setLoadingProfile(true);
                try {
                    // This call relies on the browser automatically sending the HttpOnly session cookie.
                    // The backend's /user/:id endpoint requires authentication.
                    const response = await axiosInstance.get<User>(`/user/${auth.loggedInUserId}`);
                    setUser(response.data);
                    message.success('User profile fetched successfully!');
                } catch (error: any) {
                    console.error('Failed to fetch user profile:', error.response?.data || error.message);
                    message.error(error.response?.data?.message || 'Failed to fetch user profile.');
                    if (error.response?.status === HttpStatusCode.Unauthorized) {
                        auth.logout();
                    }
                } finally {
                    setLoadingProfile(false);
                }
            }
        };
        fetchProfile();
    }, [auth.isAuthenticated, auth.loggedInUserId, auth.logout]); // Re-fetch if auth state changes

    if (auth.isLoadingAuth || loadingProfile) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 120px)' }}>
                <Spin size="large" tip="Loading user data..." />
            </div>
        );
    }

    // If not authenticated or no user ID, redirect to login (should be caught by AuthProvider's useEffect, but just in case)
    if (!auth.isAuthenticated || !auth.loggedInUserId) {
        navigate('/login');
        return null;
    }

    return (
        <Card
            title={<Title level={3} style={{ textAlign: 'center', marginBottom: 0 }}>Welcome to the Dashboard!</Title>}
            style={{ width: 600, margin: '50px auto', borderRadius: 10, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
        >
            {User ? (
                <Space direction="vertical" style={{ width: '100%' }}>
                    <p>Hello, <strong>{User.username}</strong>!</p>
                    <p>Your User ID: <strong>{User.id}</strong></p>
                    <p>Phone Number: <strong>{User.phoneNumber}</strong></p>
                    <p>Account Created: {new Date(User.createdAt).toLocaleString()}</p>
                    <p>Last Updated: {new Date(User.updatedAt).toLocaleString()}</p>
                </Space>
            ) : (
                <p style={{ textAlign: 'center', fontSize: '1.1em' }}>
                    You are logged in, but user profile could not be loaded.
                </p>
            )}
            <Button type="default" onClick={auth.logout} block style={{ marginTop: 20, borderRadius: 8 }}>
                Logout
            </Button>
        </Card>
    );
};

export default HomePage;