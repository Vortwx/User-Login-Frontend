import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, CodeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import axiosInstance from '../api/axiosInstance'; 
import { LoginUserCommand, LoginUserCommandResponse, LoginDynamicCodeCommand, LoginDynamicCodeCommandResponse } from '../api/entity'
import { useAuth } from '../auth/authContext';
import '@ant-design/v5-patch-for-react-19';

const { Title } = Typography;

const validateDynamicCode = (value: string) => {
    if (!value) {
        return Promise.reject(new Error('Please enter a dynamic code.'));
    }

    if (value.length !== 6) {
        return Promise.reject(new Error('Dynamic code must be 6 digits long.'));
    }

    const hasDigitsOnly = Array.from(value).every(char => char >= '0' && char <= '9');
    if (!hasDigitsOnly) {
        return Promise.reject(new Error('Dynamic code must contain only digits.'));
    }

    return Promise.resolve();
}

const LoginPage: React.FC = () => {
    const auth = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showDynamicCodeInput, setShowDynamicCodeInput] = useState(false);
    const [preAuthToken, setpreAuthToken] = useState<string | undefined>(undefined);

    const onLoginFinish = async (values: LoginUserCommand) => {
        setLoading(true);
        try {
            const response = await axiosInstance.post<LoginUserCommandResponse>('/auth/login', values);
            setpreAuthToken(response.data.preAuthToken);
            setShowDynamicCodeInput(true);
            message.success(response.data.message);
        } catch (error: any) {
            let errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
            errorMessage += ' You may need to create an account first.';
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const onDynamicCodeFinish = async (values: { dynamicCode: string }) => {
        if (!preAuthToken) {
            message.error('Invalid session. Please restart the process.');
            return;
        }
        setLoading(true);
        try {
            const command: LoginDynamicCodeCommand = {
                preAuthToken: preAuthToken,
                dynamicCode: values.dynamicCode,
            };
            await axiosInstance.post<LoginDynamicCodeCommandResponse>('/auth/login/dynamic-code', command);
            auth.login(); 
            message.success('Login successful! Welcome!');
        } catch (error: any) {
            console.error('Dynamic code verification failed:', error.response?.data || error.message);
            message.error(error.response?.data?.message || 'Dynamic code verification failed.');
            
        } finally {
            setLoading(false);
        }
    };

    return (
    <Card
        title={<Title level={3} style={{ textAlign: 'center', marginBottom: 0 }}>{showDynamicCodeInput ? 'Enter Dynamic Code' : 'User Login'}</Title>}
        style={{ width: 400, margin: '50px auto', borderRadius: 10, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
    >
        {!showDynamicCodeInput ? (
        <>
            <Form
                name="login_user"
                initialValues={{ remember: true }}
                onFinish={onLoginFinish}
                layout="vertical"
                requiredMark={false}
            >
                <Form.Item
                name="username"
                rules={[{ required: true, message: 'Please input your Username!' }]}
                >
                <Input prefix={<UserOutlined />} placeholder="Username" size="large" />
                </Form.Item>
                <Form.Item
                name="password"
                rules={[{ required: true, message: 'Please input your Password!' }]}
                >
                <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
                </Form.Item>
                <Form.Item>
                <Button type="primary" htmlType="submit" block loading={loading} size="large" style={{ borderRadius: 8 }}>
                    Login
                </Button>
                </Form.Item>
            </Form>

            <p style={{ textAlign: 'center', marginTop: 16 }}>
                <span
                    style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
                    onClick={() => navigate('/create')}
                >
                    Don't have an account? Create one
                </span>
            </p>
        </>
        ) : (
        <Form
            name="dynamic_code_login"
            onFinish={onDynamicCodeFinish}
            layout="vertical"
            requiredMark={false}
        >
            <p style={{ textAlign: 'center', marginBottom: 20 }}>
            A 6-digit dynamic code has been sent to your registered phone number.
            <br />
            (Check backend console for mocking)
            </p>
            <Form.Item
            name="dynamicCode"
            rules={[{ validator: (_, value) => validateDynamicCode(value) }]}
            >
            <Input prefix={<CodeOutlined />} placeholder="Dynamic Code" size="large" maxLength={6} />
            </Form.Item>
            <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading} size="large" style={{ borderRadius: 8 }}>
                Verify Code & Login
            </Button>
            </Form.Item>
        </Form>

        
        )}
    </Card>
    );
};

export default LoginPage;