import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import * as ideaService from '@/services/ideaService';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { Button } from '@/components/common/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common/Card';

export const NewIdea = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const idea = await ideaService.createIdea({ title, description });

      // Trigger analysis in the background (don't wait for it)
      ideaService.analyzeIdea(idea.id).catch(console.error);

      // Redirect immediately
      navigate(`/app/ideas/${idea.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create idea');
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">New Business Idea</h1>
        <p className="mt-2 text-text-secondary">
          Describe your business idea and let our AI analyze it
        </p>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Idea Details</CardTitle>
          <CardDescription>
            Provide a clear title and detailed description of your business idea
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <Input
              label="Idea Title"
              placeholder="e.g., Database subsetting tool for developers"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={3}
              maxLength={200}
            />

            <Textarea
              label="Description"
              placeholder="Describe your business idea in detail. What problem does it solve? Who is the target audience? What makes it unique?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              minLength={10}
              maxLength={5000}
              rows={8}
            />

            <div className="flex gap-4">
              <Button
                type="submit"
                isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Idea'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/app')}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
