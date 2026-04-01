import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, ChevronLeft, Upload, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import api from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const teachableSkills = ['React', 'Node.js', 'Python', 'Data Science', 'UI/UX Design', 'Digital Marketing', 'Cloud Computing', 'AI/ML', 'DevOps', 'Mobile Development', 'Product Management', 'SEO'];
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const MentorOnboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, setUser } = useAuth();
  const [step, setStep] = useState(1);
  const [skills, setSkills] = useState<string[]>([]);
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState(1000);
  const [experience, setExperience] = useState(0);
  const [company, setCompany] = useState('');
  const [education, setEducation] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [availability, setAvailability] = useState<Record<string, boolean>>(
    Object.fromEntries(days.map(d => [d, d !== 'Sunday']))
  );
  const [isLoading, setIsLoading] = useState(false);
  const totalSteps = 7;

  const toggleSkill = (skill: string) => {
    setSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
  };

  const handleOnboardingSubmit = async () => {
    setIsLoading(true);
    try {
      // Validate required fields
      if (!headline.trim()) {
        throw new Error('Please provide a professional headline');
      }
      if (!bio.trim()) {
        throw new Error('Please provide a bio');
      }
      if (skills.length === 0) {
        throw new Error('Please select at least one skill');
      }
      if (hourlyRate < 100) {
        throw new Error('Hourly rate must be at least ₹100');
      }

      // Create mentor profile using the new API
      const profileData = {
        fullName: user?.name || '',
        headline: headline,
        bio: bio,
        hourlyRate: hourlyRate,
        experienceYears: experience,
        currentCompany: company,
        education: education ? [{ degree: education, institution: '', year: new Date().getFullYear() }] : [],
        linkedinUrl: linkedinUrl,
        portfolioUrl: portfolioUrl,
        skillsData: skills.reduce((acc, skill) => ({ ...acc, [skill]: 'intermediate' }), {}),
        weeklySchedule: Object.fromEntries(
          Object.entries(availability).map(([day, isAvailable]) => [
            day.toLowerCase(),
            isAvailable ? ['9:00-17:00'] : []
          ])
        ),
        timeZone: 'Asia/Kolkata',
        verificationStatus: 'pending'
      };

      const response = await api.post('/mentor-profiles', profileData);
      
      setUser(response.data.user);
      toast({
        title: 'Application Submitted!',
        description: 'Our team will review your profile and verify your identity within 24-48 hours.',
      });
      navigate('/mentor/verification-pending');
    } catch (error: any) {
      console.error('Mentor onboarding error:', error);
      toast({
        title: 'Submission Failed',
        description: error.response?.data?.error || error.message || 'There was an error submitting your onboarding details. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
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
            <div><h2 className="text-2xl font-bold">What skills do you teach?</h2>
              <p className="text-muted-foreground mt-1">Select your areas of expertise.</p></div>
            <div className="flex flex-wrap gap-2">
              {teachableSkills.map(skill => (
                <Badge key={skill} variant={skills.includes(skill) ? 'default' : 'outline'}
                  className="cursor-pointer text-sm py-1.5 px-3" onClick={() => toggleSkill(skill)}>
                  {skills.includes(skill) && <Check className="h-3 w-3 mr-1" />}{skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div><h2 className="text-2xl font-bold">Professional Headline</h2>
              <p className="text-muted-foreground mt-1">This appears on your public profile.</p></div>
            <input type="text" value={headline} onChange={e => setHeadline(e.target.value)}
              placeholder="e.g., Senior Full-Stack Developer at Google"
              className="w-full h-12 px-4 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div><h2 className="text-2xl font-bold">Tell us about yourself</h2>
              <p className="text-muted-foreground mt-1">Share your teaching philosophy and experience.</p></div>
            <textarea value={bio} onChange={e => setBio(e.target.value)}
              placeholder="Share your experience, teaching style, and what learners can expect..."
              className="w-full h-40 p-4 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none" />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div><h2 className="text-2xl font-bold">Set your hourly rate</h2>
              <p className="text-muted-foreground mt-1">You can change this anytime.</p></div>
            <div className="text-center space-y-4">
              <div className="text-4xl font-bold text-primary">₹{hourlyRate}</div>
              <input type="range" min={500} max={5000} step={100} value={hourlyRate}
                aria-label="Hourly rate"
                onChange={e => setHourlyRate(Number(e.target.value))}
                className="w-full accent-primary" />
              <div className="flex justify-between text-xs text-muted-foreground"><span>₹500</span><span>₹5,000</span></div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <div><h2 className="text-2xl font-bold">Background & Experience</h2>
              <p className="text-muted-foreground mt-1">Add your relevant background to build trust.</p></div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Years of Experience</label>
                <input type="number" min="0" value={experience} onChange={e => setExperience(Number(e.target.value))} className="w-full h-10 px-4 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Current/Past Company</label>
                <input placeholder="e.g. Google, Microsoft, Freelance" value={company} onChange={e => setCompany(e.target.value)} className="w-full h-10 px-4 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Education details</label>
                <input placeholder="e.g. B.Tech in Computer Science from IIT" value={education} onChange={e => setEducation(e.target.value)} className="w-full h-10 px-4 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">LinkedIn Profile URL</label>
                <input placeholder="https://linkedin.com/in/username" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} className="w-full h-10 px-4 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Portfolio/GitHub URL (Optional)</label>
                <input placeholder="https://github.com/username" value={portfolioUrl} onChange={e => setPortfolioUrl(e.target.value)} className="w-full h-10 px-4 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-6">
            <div><h2 className="text-2xl font-bold">Set your availability</h2>
              <p className="text-muted-foreground mt-1">Select days you're available for sessions.</p></div>
            <div className="space-y-2">
              {days.map(day => (
                <label key={day} className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-secondary/50">
                  <span className="font-medium text-sm">{day}</span>
                  <input type="checkbox" checked={availability[day]} onChange={() => setAvailability(prev => ({ ...prev, [day]: !prev[day] }))}
                    className="rounded border-border" />
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="space-y-6">
            <div><h2 className="text-2xl font-bold">Upload ID for verification</h2>
              <p className="text-muted-foreground mt-1">We verify all mentors for learner safety. Upload Aadhaar or any government ID.</p></div>
            <div className="border-2 border-dashed rounded-xl p-8 text-center space-y-3">
              <Upload className="h-10 w-10 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">Drag & drop or click to upload</p>
              <Button variant="outline">Choose File</Button>
            </div>
          </div>
        )}
      </main>

      <div className="border-t bg-card">
        <div className="container max-w-2xl mx-auto px-4 py-4 flex justify-between">
          <Button variant="ghost" onClick={() => step > 1 && setStep(step - 1)} disabled={step === 1 || isLoading}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          {step < totalSteps ? (
            <Button onClick={() => setStep(step + 1)} disabled={isLoading}>Next <ChevronRight className="h-4 w-4 ml-1" /></Button>
          ) : (
            <Button onClick={handleOnboardingSubmit} disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit for Verification'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorOnboarding;
