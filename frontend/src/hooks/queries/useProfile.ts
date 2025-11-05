import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as profileService from "@/services/profileService";
import { User, UserProfileData } from "@/types";
import toast from "react-hot-toast";
import { authKeys } from "./useAuth";

// Query keys
export const profileKeys = {
  all: () => ["profile"] as const,
  detail: () => [...profileKeys.all(), "detail"] as const,
};

/**
 * Hook to get the current user's profile
 */
export const useProfile = () => {
  return useQuery<User>({
    queryKey: profileKeys.detail(),
    queryFn: profileService.getProfile,
  });
};

/**
 * Hook to update the current user's profile
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<
    User,
    Error,
    { name?: string; profileData?: UserProfileData },
    { previousProfile?: User }
  >({
    mutationFn: profileService.updateProfile,
    onMutate: async (updates) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: profileKeys.detail() });

      // Snapshot the previous value
      const previousProfile = queryClient.getQueryData<User>(profileKeys.detail());

      // Optimistically update the profile
      if (previousProfile) {
        queryClient.setQueryData<User>(profileKeys.detail(), {
          ...previousProfile,
          ...updates,
          profileData: updates.profileData
            ? { ...previousProfile.profileData, ...updates.profileData }
            : previousProfile.profileData,
        });
      }

      // Return context with the snapshot
      return { previousProfile };
    },
    onError: (_error, _updates, context) => {
      // Rollback on error
      if (context?.previousProfile) {
        queryClient.setQueryData(profileKeys.detail(), context.previousProfile);
      }
    },
    onSuccess: (updatedProfile) => {
      // Update both profile and auth user queries
      queryClient.setQueryData(profileKeys.detail(), updatedProfile);
      queryClient.setQueryData(authKeys.currentUser(), updatedProfile);
      toast.success("Profile updated successfully!");
    },
    onSettled: () => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: profileKeys.detail() });
      queryClient.invalidateQueries({ queryKey: authKeys.currentUser() });
    },
    meta: {
      errorMessage: "Failed to update profile. Please try again.",
    },
  });
};
