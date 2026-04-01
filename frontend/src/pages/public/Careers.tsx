import { MapPin, Briefcase, Heart, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const openings = [
  { id: '1', title: 'Senior Frontend Developer', department: 'Engineering', location: 'Mumbai (Hybrid)', type: 'Full-time' },
  { id: '2', title: 'Product Designer', department: 'Design', location: 'Remote', type: 'Full-time' },
  { id: '3', title: 'Growth Marketing Manager', department: 'Marketing', location: 'Bangalore (On-site)', type: 'Full-time' },
  { id: '4', title: 'Community Manager', department: 'Operations', location: 'Remote', type: 'Full-time' },
  { id: '5', title: 'Backend Engineer', department: 'Engineering', location: 'Mumbai (Hybrid)', type: 'Full-time' },
];

const values = [
  { title: 'Learn Constantly', description: 'We practice what we preach — continuous growth is in our DNA.' },
  { title: 'People First', description: 'Every decision starts with how it impacts our learners and mentors.' },
  { title: 'Build with Trust', description: 'Transparency and integrity guide everything we do.' },
  { title: 'Move Fast, Stay Kind', description: 'We ship quickly but never at the cost of quality or empathy.' },
];

const Careers = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <div className="py-20 px-4 text-center" style={{ background: 'var(--hero-gradient)' }}>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Join Our Team</h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Help us build India's most trusted live mentorship platform. We're looking for passionate people who believe in the power of personalized learning.
          </p>
        </div>

        <div className="container max-w-5xl mx-auto px-4 py-12">
          {/* Values */}
          <h2 className="text-2xl font-bold mb-6 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {values.map(v => (
              <Card key={v.title}>
                <CardContent className="p-5">
                  <Heart className="h-6 w-6 text-primary mb-3" />
                  <h3 className="font-semibold mb-1">{v.title}</h3>
                  <p className="text-sm text-muted-foreground">{v.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Openings */}
          <h2 className="text-2xl font-bold mb-6">Open Positions</h2>
          <div className="space-y-4">
            {openings.map(job => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold">{job.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">{job.department}</Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Briefcase className="h-3 w-3" />{job.type}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1">Apply <ArrowRight className="h-3 w-3" /></Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Careers;
