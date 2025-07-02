import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import axiosInstance from '../api/axiosInstance';
import { CreateUserCommand, CreateUserCommandResponse } from '../api/entity';
import '@ant-design/v5-patch-for-react-19';

const { Title } = Typography;

const validatePassword = (value: string) => {
    if (!value) {
        return Promise.reject(new Error('Please enter a password.'));
    }
    if (value.length < 8) {
        return Promise.reject(new Error('Password must be at least 8 characters long.'));
    }
    const hasUppercase = Array.from(value).some(char => char >= 'A' && char <= 'Z');
    if (!hasUppercase) {
        return Promise.reject(new Error('Password must contain at least one uppercase letter.'));
    }
    const hasLowercase = Array.from(value).some(char => char >= 'a' && char <= 'z');
    if (!hasLowercase) {
        return Promise.reject(new Error('Password must contain at least one lowercase letter.'));
    }
    const hasDigit = Array.from(value).some(char => char >= '0' && char <= '9');
    if (!hasDigit) {
        return Promise.reject(new Error('Password must contain at least one number.'));
    }
    const specialChars = `!"#$%&'()*+,-./:;<=>?@[\\]^_\`{|}~`;
    const hasSpecialChar = Array.from(value).some((char) => specialChars.includes(char));
    if (!hasSpecialChar) {
        return Promise.reject(new Error('Password must contain at least one special character.'));
    }

    return Promise.resolve();
}

const validatePhoneNumber = (value: string) => {
    if (!value) {
        return Promise.reject(new Error('Please enter a phone number.'));
    }
    if (value.length !== 10) {
        return Promise.reject(new Error('Phone number must be 10 digits long.'));
    }
    const hasDigitsOnly = Array.from(value).every(char => char >= '0' && char <= '9');
    if (!hasDigitsOnly) {
        return Promise.reject(new Error('Phone number must contain only digits.'));
    }
    return Promise.resolve();
}

const CreateUserPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values: CreateUserCommand) => {
        setLoading(true);
        try {
            const response = await axiosInstance.post<CreateUserCommandResponse>('/auth/create', values);
            message.success(`User ${response.data.username} created successfully! Please login.`);
            navigate('/login');
        } catch (error: any) {
            console.error('User creation failed:', error.response?.data || error.message);
            message.error(error.response?.data?.message || 'User creation failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
    <Card
        title={<Title level={3} style={{ textAlign: 'center', marginBottom: 0 }}>Create New User</Title>}
        style={{ width: 400, margin: '50px auto', borderRadius: 10, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
    >
        <Form
        name="create_user"
        initialValues={{ remember: true }}
        onFinish={onFinish}
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
                rules={[{ validator: (_, value) => validatePassword(value) }]}
            >
                <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
            </Form.Item>
            <Form.Item
                name="phoneNumber"
                rules={[{ validator: (_, value) => validatePhoneNumber(value) }]}
            >
                <Input prefix={<PhoneOutlined />} placeholder="Phone Number (e.g., 1234567890)" size="large" />
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit" block loading={loading} size="large" style={{ borderRadius: 8 }}>
                Create Account
                </Button>
            </Form.Item>
        </Form>
    </Card>
    );
};

export default CreateUserPage;