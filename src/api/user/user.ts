import axiosInstance from "../axiosInstance";
import { User } from "../entity";

export const getUserById = async( id: string): Promise<User> => {
    try{
        const response = await axiosInstance.get(`/user/${id}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}