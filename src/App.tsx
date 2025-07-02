import React from 'react';
import { Layout, Button, Space, Typography } from 'antd';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

import CreateUserPage from './page/createUserPage';
import LoginPage from './page/loginPage';
import HomePage from './page/homePage';

import   { useAuth } from './auth/authContext';

const { Header, Content } = Layout;
const { Title } = Typography;

const App: React.FC = () => {
    const auth = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f0f0' }}>
            <Header style={{ backgroundColor: 'black', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Title level={3} style={{ color: 'white', margin: 0 }}>User Login Page</Title>
                <Space>
                {auth.isAuthenticated ? (
                    <Button type="default" onClick={auth.logout} style={{ borderRadius: 8 }}>
                        Logout
                    </Button>
                ) : (
                    <Button
                        type="default"
                        onClick={() =>
                            location.pathname === '/create'
                                ? navigate('/login')
                                : navigate('/create')
                        }
                        style={{ borderRadius: 8 }}
                    >
                        {location.pathname === '/create' ? 'Login' : 'Create Account'}
                    </Button>
                )}
                </Space>
            </Header>
            <Content style={{ padding: '50px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
                <Routes>
                    <Route path="/create" element={<CreateUserPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/" element={<LoginPage />} />
                </Routes>
            </Content>
        </Layout>
    );
};

export default App;