import { Link } from 'react-router-dom';
import { BookOpen, Clock, Star, Calendar, ChevronRight, Heart, TrendingUp, Video, Bell, ArrowRight, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import LearnerLayout from '@/components/LearnerLayout';
import { useLearnerAnalytics, useLearnerSessions, useWallet } from '@/hooks/useApi';
import { format } from 'date-fns';
import { LearnerDashboardSkeleton } from '@/components/LoadingSkeleton';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';

const LearnerDashboard = () => {
  const { data: analytics, isLoading: analyticsLoading } = useLearnerAnalytics();
  const { data: sessions, isLoading: sessionsLoading } = useLearnerSessions();
  const { data: wallet, isLoading: walletLoading } = useWallet();

  const upcomingSessions = sessions?.filter((s: any) => s.status === 'CONFIRMED' || s.status === 'PENDING') || [];
  const pastSessions = sessions?.filter((s: any) => s.status === 'COMPLETED') || [];

  // Auto-refresh every 60 s as a fallback to socket real-time updates
  useAutoRefresh([['analytics', 'learner'], ['sessions', 'learner'], ['wallet']], 60_000);

  if (analyticsLoading || sessionsLoading || walletLoading) {
    return (
      <LearnerLayout>
        <LearnerDashboardSkeleton />
      </LearnerLayout>
    );
  }

  return (
    <ErrorBoundary>
      <LearnerLayout>
        <div className="p-6 md:p-8 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">My Learning Dashboard</h1>
            <p className="text-sm text-muted-foreground">Track your progress and manage sessions</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2"><Bell className="h-4 w-4" /> Notifications</Button>
            <Link to="/mentors"><Button size="sm" className="gap-2"><BookOpen className="h-4 w-4" /> Find Mentors</Button></Link>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Sessions', value: analytics?.totalSessions?.toString() || '0', icon: Video },
            { label: 'Completed', value: analytics?.completedSessions?.toString() || '0', icon: Clock },
            { label: 'Wallet Balance', value: `₹${Number(wallet?.balance || 0).toLocaleString('en-IN')}`, icon: Wallet },
            { label: 'Sessions To Go', value: upcomingSessions.length.toString(), icon: Calendar },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}><CardContent className="p-5">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3"><Icon className="h-5 w-5 text-primary" /></div>
                <div className="text-2xl font-bold tabular-nums">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </CardContent></Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Upcoming Sessions</CardTitle>
                  <Link to="/learner/sessions" className="text-sm text-primary hover:underline">View All</Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingSessions.map((session: any) => (
                  <div key={session.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                        {session.mentor?.user?.name?.split(' ').map((n: string) => n[0]).join('') || 'M'}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{session.mentor?.user?.name}</p>
                        <p className="text-xs text-muted-foreground">{session.status}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{format(new Date(session.startTime), 'MMM d, yyyy')}</p>
                      <p className="text-xs text-muted-foreground flex items-center justify-end gap-1"><Clock className="h-3 w-3" /> {format(new Date(session.startTime), 'HH:mm')}</p>
                    </div>
                  </div>
                ))}
                {upcomingSessions.length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No upcoming sessions</p>
                    <Link to="/mentors"><Button variant="link" size="sm" className="mt-2 gap-1">Book a session <ArrowRight className="h-3 w-3" /></Button></Link>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-lg">Past Sessions</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {pastSessions.map((session: any) => (
                  <div key={session.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center text-sm font-bold">
                        {session.mentor?.user?.name?.split(' ').map((n: string) => n[0]).join('') || 'M'}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{session.mentor?.user?.name}</p>
                        <p className="text-xs text-muted-foreground">Completed</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      {session.review && (
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: session.review.rating }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          ))}
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground">{format(new Date(session.startTime), 'MMM d')}</span>
                    </div>
                  </div>
                ))}
                {pastSessions.length === 0 && (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    No past sessions yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /> Skill Progress</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                <div className="text-center py-4 text-sm text-muted-foreground">
                  Start learning to see your progress here.
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-lg flex items-center gap-2"><Wallet className="h-5 w-5 text-primary" /> Wallet</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground">Available Balance</p>
                  <p className="text-2xl font-bold tabular-nums">₹{Number(wallet?.balance || 0).toLocaleString('en-IN')}</p>
                </div>
                <Link to="/learner/wallet"><Button className="w-full gap-2" size="sm"><Wallet className="h-4 w-4" /> Manage Wallet</Button></Link>
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </LearnerLayout>
    </ErrorBoundary>
  );
};

export default LearnerDashboard;
