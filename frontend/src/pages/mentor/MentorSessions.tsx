import { Link } from 'react-router-dom';
import { Calendar, Clock, Video, Star, RotateCcw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MentorLayout from '@/components/MentorLayout';
import { useState } from 'react';
import { useMentorSessions } from '@/hooks/useApi';
import { format } from 'date-fns';

type Tab = 'upcoming' | 'past';

const MentorSessions = () => {
  const [tab, setTab] = useState<Tab>('upcoming');
  const { data: sessions = [], isLoading } = useMentorSessions();

  const filteredSessions = sessions.filter((s: any) => {
    if (tab === 'upcoming') return s.status === 'CONFIRMED' || s.status === 'PENDING';
    if (tab === 'past') return s.status === 'COMPLETED';
    return false;
  });

  if (isLoading) {
    return (
      <MentorLayout>
        <div className="p-6 md:p-8 flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MentorLayout>
    );
  }

  return (
    <MentorLayout>
      <div className="p-6 md:p-8 max-w-5xl">
        <h1 className="text-2xl font-bold mb-1">My Sessions</h1>
        <p className="text-muted-foreground mb-6">Manage your mentoring sessions</p>

        <div className="flex gap-1 mb-6 bg-secondary rounded-lg p-1 max-w-xs">
          {(['upcoming', 'past'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-card shadow-sm' : 'text-muted-foreground'}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredSessions.map((session: any) => (
            <Card key={session.id}>
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary shrink-0">
                  {session.learner?.user?.name?.split(' ').map((n: string) => n[0]).join('') || 'L'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{session.learner?.user?.name}</p>
                  <p className="text-sm text-muted-foreground">{session.status}</p>
                  <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{format(new Date(session.startTime), 'MMM d, yyyy')}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{format(new Date(session.startTime), 'HH:mm')}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {tab === 'upcoming' && (
                    <div className="flex gap-2 mt-2">
                      <Link to={`/chat/${session.learnerId}`}><Button size="sm" className="gap-1"><Video className="h-3 w-3" /> Chat / Join</Button></Link>
                      <Button size="sm" variant="outline"><RotateCcw className="h-3 w-3" /></Button>
                    </div>
                  )}
                  {tab === 'past' && session.review && (
                    <div className="flex items-center gap-1 mt-2 text-sm text-yellow-500">
                      <Star className="h-3 w-3 fill-current" /> {session.review.rating}/5
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredSessions.length === 0 && (
            <div className="text-center py-12 border rounded-xl bg-secondary/20">
              <p className="text-muted-foreground">No {tab} sessions found.</p>
            </div>
          )}
        </div>
      </div>
    </MentorLayout>
  );
};

export default MentorSessions;
