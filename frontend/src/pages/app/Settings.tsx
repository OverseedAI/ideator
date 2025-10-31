import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common/Card';

export const Settings = () => {
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-2 text-text-secondary">
          Manage your account settings
        </p>
      </div>

      <div className="space-y-6 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-text-secondary">Email</dt>
                <dd className="mt-1 text-text-primary">{user?.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-text-secondary">Name</dt>
                <dd className="mt-1 text-text-primary">{user?.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-text-secondary">
                  Member Since
                </dt>
                <dd className="mt-1 text-text-primary">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : 'N/A'}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Customize your experience</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-text-secondary">
              Additional settings coming soon...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
