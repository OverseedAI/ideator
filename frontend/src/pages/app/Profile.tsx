import { useState, useEffect, FormEvent } from "react";
import { UserProfileData } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import * as profileService from "@/services/profileService";
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

export const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [expertise, setExpertise] = useState("");
  const [funding, setFunding] = useState("");
  const [followers, setFollowers] = useState("");
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [company, setCompany] = useState("");
  const [experience, setExperience] = useState("");
  const [industries, setIndustries] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.profileData) {
      const profile = user.profileData;
      setExpertise(profile.expertise?.join(", ") || "");
      setFunding(profile.funding || "");
      setFollowers(profile.followers?.toString() || "");
      setLinkedInUrl(profile.linkedInUrl || "");
      setCompany(profile.company || "");
      setExperience(profile.experience || "");
      setIndustries(profile.industries?.join(", ") || "");
    }
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const profileData: UserProfileData = {
        expertise: expertise
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        funding: funding || undefined,
        followers: followers ? parseInt(followers) : undefined,
        linkedInUrl: linkedInUrl || undefined,
        company: company || undefined,
        experience: experience || undefined,
        industries: industries
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      await profileService.updateProfile({
        name,
        profileData,
      });

      await refreshUser();
      setSuccess("Profile updated successfully!");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

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
            {success && (
              <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">{success}</div>
            )}

            {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</div>}

            <Input
              label="Name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Expertise"
              placeholder="e.g., Software Engineering, Marketing, Finance (comma-separated)"
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
            />

            <Input
              label="Company"
              placeholder="Your current or previous company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />

            <Input
              label="Industries"
              placeholder="e.g., SaaS, E-commerce, Healthcare (comma-separated)"
              value={industries}
              onChange={(e) => setIndustries(e.target.value)}
            />

            <Textarea
              label="Experience"
              placeholder="Describe your professional experience"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              rows={4}
            />

            <Input
              label="Available Funding"
              placeholder="e.g., $50,000, Bootstrapped, Pre-seed"
              value={funding}
              onChange={(e) => setFunding(e.target.value)}
            />

            <Input
              type="number"
              label="Followers/Network Size"
              placeholder="e.g., 5000"
              value={followers}
              onChange={(e) => setFollowers(e.target.value)}
            />

            <Input
              type="url"
              label="LinkedIn URL"
              placeholder="https://linkedin.com/in/yourprofile"
              value={linkedInUrl}
              onChange={(e) => setLinkedInUrl(e.target.value)}
            />

            <Button type="submit" isLoading={isLoading} disabled={isLoading}>
              Save Profile
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
