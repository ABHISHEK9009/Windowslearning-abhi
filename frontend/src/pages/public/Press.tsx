import { Calendar, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const pressReleases = [
  { id: '1', title: 'Windows Learning Raises ₹10 Crore in Seed Funding', date: 'Mar 15, 2026', source: 'YourStory' },
  { id: '2', title: 'Windows Learning Crosses 50,000 Sessions Milestone', date: 'Feb 28, 2026', source: 'Inc42' },
  { id: '3', title: 'How Windows Learning is Disrupting Online Education in India', date: 'Feb 10, 2026', source: 'Economic Times' },
  { id: '4', title: 'Windows Learning Launches Corporate Training Program', date: 'Jan 20, 2026', source: 'Business Standard' },
];

const stats = [
  { label: 'Verified Mentors', value: '2,500+' },
  { label: 'Sessions Completed', value: '50,000+' },
  { label: 'Satisfaction Rate', value: '98%' },
  { label: 'Mentor Payouts', value: '₹50L+' },
];

const Press = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-12 px-4" style={{ backgroundColor: 'hsl(var(--surface-warm))' }}>
        <div className="container max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Press & Media</h1>
          <p className="text-muted-foreground mb-8">Latest news and media coverage about Windows Learning</p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {stats.map(s => (
              <Card key={s.label}>
                <CardContent className="p-5 text-center">
                  <p className="text-2xl font-bold text-primary">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Press Releases */}
          <h2 className="text-xl font-bold mb-6">Press Coverage</h2>
          <div className="space-y-4 mb-12">
            {pressReleases.map(pr => (
              <Card key={pr.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold">{pr.title}</h3>
                    <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{pr.date}</span>
                      <span>{pr.source}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1"><ExternalLink className="h-3 w-3" /> Read</Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Media Contact */}
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="font-semibold text-lg mb-2">Media Inquiries</h3>
              <p className="text-sm text-muted-foreground mb-4">For press inquiries, interviews, or media kit requests, reach out to us.</p>
              <Button className="gap-1">Contact Press Team</Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Press;
