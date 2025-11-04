import api from "./api";
import { User, UserProfileData } from "@/types";

export const getProfile = async (): Promise<User> => {
  const response = await api.get<User>("/profile");
  return response.data;
};

export const updateProfile = async (data: {
  name?: string;
  profileData?: UserProfileData;
}): Promise<User> => {
  const response = await api.put<User>("/profile", data);
  return response.data;
};
