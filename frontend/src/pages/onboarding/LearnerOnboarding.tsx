import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, ChevronLeft, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useUpdateProfile } from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const allSkills = ['Web Development', 'Data Science', 'UI/UX Design', 'Digital Marketing', 'Mobile Development', 'Cloud Computing', 'AI/ML', 'DevOps', 'Product Management', 'Content Writing', 'SEO', 'Graphic Design'];
const levels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

const LearnerOnboarding = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const { toast } = useToast();
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const [step, setStep] = useState(1);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [level, setLevel] = useState('');
  const [goals, setGoals] = useState('');
  const totalSteps = 4;

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
  };

  const handleComplete = () => {
    updateProfile({
      bio: goals,
      experienceLevel: level,
      // skills: selectedSkills // We'll handle many-to-many skills later if needed
    }, {
      onSuccess: async () => {
        await refreshUser();
        toast({ title: "Profile Updated!", description: "Welcome to Windows Learning." });
        navigate('/dashboard');
      },
      onError: (error: any) => {
        toast({ title: "Update Failed", description: error.response?.data?.message || "Could not save profile.", variant: "destructive" });
      }
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="border-b bg-card">
        <div className="container max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-lg font-bold">Windows<span className="text-accent">Learning</span></span>
          <span className="text-sm text-muted-foreground">Step {step} of {totalSteps}</span>
        </div>
      </div>

      <div className="container max-w-2xl mx-auto px-4 py-4">
        <Progress value={(step / totalSteps) * 100} className="h-2" />
      </div>

      <main className="flex-1 container max-w-2xl mx-auto px-4 py-8">
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">What skills do you want to learn?</h2>
              <p className="text-muted-foreground mt-1">Select skills you're interested in. You can always update later.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {allSkills.map(skill => (
                <Badge key={skill} variant={selectedSkills.includes(skill) ? 'default' : 'outline'}
                  className="cursor-pointer text-sm py-1.5 px-3" onClick={() => toggleSkill(skill)}>
                  {selectedSkills.includes(skill) && <Check className="h-3 w-3 mr-1" />}
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">What's your experience level?</h2>
              <p className="text-muted-foreground mt-1">This helps us match you with the right mentors.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {levels.map(l => (
                <button key={l} onClick={() => setLevel(l)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${level === l ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}>
                  <span className="font-medium">{l}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">What are your learning goals?</h2>
              <p className="text-muted-foreground mt-1">Tell us what you'd like to achieve.</p>
            </div>
            <textarea value={goals} onChange={(e) => setGoals(e.target.value)}
              placeholder="e.g., I want to become a full-stack developer and land a job at a top tech company..."
              className="w-full h-40 p-4 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Add a profile picture</h2>
              <p className="text-muted-foreground mt-1">Help mentors recognize you. You can skip this step.</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="w-32 h-32 rounded-full bg-secondary flex items-center justify-center border-2 border-dashed border-border">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
              <Button variant="outline">Upload Photo</Button>
            </div>
          </div>
        )}
      </main>

      <div className="border-t bg-card">
        <div className="container max-w-2xl mx-auto px-4 py-4 flex justify-between">
          <Button variant="ghost" onClick={() => step > 1 ? setStep(step - 1) : null} disabled={step === 1}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          {step < totalSteps ? (
            <Button onClick={() => setStep(step + 1)}>
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleComplete} disabled={isPending}>
              {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Completing...</> : 'Complete Onboarding'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearnerOnboarding;
