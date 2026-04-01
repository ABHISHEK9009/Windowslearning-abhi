import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, DollarSign, MapPin, Calendar, Paperclip, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LearnerLayout from '@/components/LearnerLayout';
import { usePostRequirement, useRequirements } from '@/hooks/useApi';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const skillOptions = ['Web Development', 'Data Science', 'UI/UX Design', 'Digital Marketing', 'Mobile Development', 'Cloud Computing', 'AI/ML', 'DevOps'];

type LearnerRequirement = {
  id: string;
  learnerId: string;
  title: string;
  description: string;
  budget: number | null;
  createdAt: string | Date;
  _count?: { proposals?: number };
};

type UserWithLearnerProfile = {
  learnerProfile?: { id: string } | null;
};

const PostRequirement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { mutate: postRequirement, isPending } = usePostRequirement();
  const { user } = useAuth();
  const { data: requirements = [], isLoading: requirementsLoading } = useRequirements();

  const learnerProfileId = (user as unknown as UserWithLearnerProfile | null)?.learnerProfile?.id;
  const typedRequirements = requirements as unknown as LearnerRequirement[];
  const postedRequirements = typedRequirements.filter((r) => r.learnerId === learnerProfileId);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skill, setSkill] = useState('');
  const [budget, setBudget] = useState(1000);
  const [mode, setMode] = useState('online');
  const [deadline, setDeadline] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    postRequirement({
      title,
      description,
      budget,
      // skills: [skill], // Backend might need adjustment for multiple skills
    }, {
      onSuccess: () => {
        toast({ title: "Requirement posted!", description: "Mentors will now be able to see your request." });
        navigate('/dashboard');
      },
      onError: (err: unknown) => {
        const message = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
        toast({ title: "Post failed", description: message || "Could not post requirement.", variant: "destructive" });
      }
    });
  };

  return (
    <LearnerLayout>
      <div className="p-6 md:p-8 max-w-4xl">
        <h1 className="text-2xl font-bold mb-1">Post a Learning Requirement</h1>
        <p className="text-muted-foreground mb-6">Describe what you need and let mentors come to you</p>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardContent className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Need help with React & Next.js project"
                  className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" required />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4}
                  placeholder="Describe what you want to learn, your current level, and specific topics..."
                  className="w-full p-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none" required />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Skill / Category</label>
                <select value={skill} onChange={e => setSkill(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                  <option value="">Select a skill</option>
                  {skillOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Budget (₹/session)</label>
                <input type="number" value={budget} onChange={e => setBudget(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Preferred Mode</label>
                <div className="flex gap-3">
                  {['online', 'offline', 'both'].map(m => (
                    <button key={m} type="button" onClick={() => setMode(m)}
                      className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium capitalize transition-colors ${mode === m ? 'border-primary bg-primary/5 text-primary' : 'text-muted-foreground'}`}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Deadline</label>
                <input type="date" value={deadline} aria-label="Deadline" onChange={e => setDeadline(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Posting...</> : 'Post Requirement'}
            </Button>
            <Button variant="outline" type="button" onClick={() => navigate('/mentors')}>Cancel</Button>
          </div>
        </form>

        {/* Live learner requirements (real-time via socket -> query invalidation) */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3">Your Posted Requirements</h2>
          {requirementsLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <div className="space-y-3">
              {postedRequirements.slice(0, 10).map((r) => (
                  <Card key={r.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{r.title}</p>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {r.description}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <span>{r.budget ? `Budget: ₹${r.budget}` : 'Budget not set'}</span>
                            <span>•</span>
                            <span>Posted {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}</span>
                          </div>
                        </div>
                        <div className="shrink-0">
                          <Badge variant="secondary">
                            {(r._count?.proposals ?? 0)} proposal{(r._count?.proposals ?? 0) === 1 ? '' : 's'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

              {postedRequirements.length === 0 && (
                <div className="text-center py-10 border rounded-xl bg-secondary/20 text-muted-foreground">
                  No requirements posted yet.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </LearnerLayout>
  );
};

export default PostRequirement;
