import { useEffect, useState, FormEvent } from "react";
import { UserProfileData } from "@/types";
import { Input } from "@/components/common/Input";
import { Textarea } from "@/components/common/Textarea";
import { Button } from "@/components/common/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/common/Card";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useProfile as useProfileQuery, useUpdateProfile } from "@/hooks/queries/useProfile";
import { getErrorMessage } from "@/utils/error";

interface ProfileFormState {
  name: string;
  expertise: string;
  funding: string;
  followers: string;
  linkedInUrl: string;
  company: string;
  experience: string;
  industries: string;
}

export const Profile = () => {
  const { data: profile, isLoading, isError, error } = useProfileQuery();
  const updateProfileMutation = useUpdateProfile();
  const [formState, setFormState] = useState<ProfileFormState>({
    name: "",
    expertise: "",
    funding: "",
    followers: "",
    linkedInUrl: "",
    company: "",
    experience: "",
    industries: "",
  });

  useEffect(() => {
    if (!profile) return;
    setFormState({
      name: profile.name ?? "",
      expertise: profile.profileData?.expertise?.join(", ") ?? "",
      funding: profile.profileData?.funding ?? "",
      followers: profile.profileData?.followers?.toString() ?? "",
      linkedInUrl: profile.profileData?.linkedInUrl ?? "",
      company: profile.profileData?.company ?? "",
      experience: profile.profileData?.experience ?? "",
      industries: profile.profileData?.industries?.join(", ") ?? "",
    });
  }, [profile]);

  const handleChange = (field: keyof ProfileFormState) => (value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const parseList = (value: string) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const followersValue = formState.followers ? Number(formState.followers) : undefined;
    const normalizedFollowers =
      followersValue !== undefined && !Number.isNaN(followersValue) ? followersValue : undefined;

    const profileData: UserProfileData = {
      expertise: parseList(formState.expertise),
      funding: formState.funding || undefined,
      followers: normalizedFollowers,
      linkedInUrl: formState.linkedInUrl || undefined,
      company: formState.company || undefined,
      experience: formState.experience || undefined,
      industries: parseList(formState.industries),
    };

    updateProfileMutation.mutate({
      name: formState.name,
      profileData,
    });
  };

  if (isLoading && !profile) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-800">
        {getErrorMessage(error, "Failed to load profile")}
      </div>
    );
  }

  const mutationErrorMessage = getErrorMessage(
    updateProfileMutation.error,
    "Failed to update profile"
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="mt-2 text-text-secondary">Update your profile to get personalized analysis</p>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            This information helps our AI provide more relevant insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {mutationErrorMessage && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
                {mutationErrorMessage}
              </div>
            )}

            <Input
              label="Name"
              placeholder="Your name"
              value={formState.name}
              onChange={(e) => handleChange("name")(e.target.value)}
              required
              disabled={updateProfileMutation.isPending}
            />

            <Input
              label="Expertise"
              placeholder="e.g., Software Engineering, Marketing, Finance (comma-separated)"
              value={formState.expertise}
              onChange={(e) => handleChange("expertise")(e.target.value)}
              disabled={updateProfileMutation.isPending}
            />

            <Input
              label="Company"
              placeholder="Your current or previous company"
              value={formState.company}
              onChange={(e) => handleChange("company")(e.target.value)}
              disabled={updateProfileMutation.isPending}
            />

            <Input
              label="Industries"
              placeholder="e.g., SaaS, E-commerce, Healthcare (comma-separated)"
              value={formState.industries}
              onChange={(e) => handleChange("industries")(e.target.value)}
              disabled={updateProfileMutation.isPending}
            />

            <Textarea
              label="Experience"
              placeholder="Describe your professional experience"
              value={formState.experience}
              onChange={(e) => handleChange("experience")(e.target.value)}
              rows={4}
              disabled={updateProfileMutation.isPending}
            />

            <Input
              label="Available Funding"
              placeholder="e.g., $50,000, Bootstrapped, Pre-seed"
              value={formState.funding}
              onChange={(e) => handleChange("funding")(e.target.value)}
              disabled={updateProfileMutation.isPending}
            />

            <Input
              type="number"
              label="Followers/Network Size"
              placeholder="e.g., 5000"
              value={formState.followers}
              onChange={(e) => handleChange("followers")(e.target.value)}
              disabled={updateProfileMutation.isPending}
            />

            <Input
              type="url"
              label="LinkedIn URL"
              placeholder="https://linkedin.com/in/yourprofile"
              value={formState.linkedInUrl}
              onChange={(e) => handleChange("linkedInUrl")(e.target.value)}
              disabled={updateProfileMutation.isPending}
            />

            <Button
              type="submit"
              isLoading={updateProfileMutation.isPending}
              disabled={updateProfileMutation.isPending}
            >
              Save Profile
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
