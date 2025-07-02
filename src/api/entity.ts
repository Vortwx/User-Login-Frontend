export interface User {
    id: string;
    username: string;
    phoneNumber: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateUserCommand {
    username: string;
    password: string;
    phoneNumber: string;
}

export interface LoginUserCommand {
    username: string;
    password: string;
}

export interface LoginDynamicCodeCommand {
    preAuthToken: string;
    dynamicCode: string;
}

// Response DTOs
export interface CreateUserCommandResponse {
    id: string;
    username: string;
    phoneNumber: string;
}

export interface LoginUserCommandResponse {
    message: string;
    preAuthToken: string;
}

export interface LoginDynamicCodeCommandResponse {
}