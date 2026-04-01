import { Link } from 'react-router-dom';
import { IndianRupee, TrendingUp, Users, Calendar, Clock, Star, ArrowUpRight, Video, Bell, ChevronRight, Wallet, BarChart3, Inbox, FileText, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MentorLayout from '@/components/MentorLayout';
import { useMentorAnalytics, useMentorSessions, useRequirements } from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { MentorDashboardSkeleton } from '@/components/LoadingSkeleton';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';

const MentorDashboard = () => {
  const { user } = useAuth();
  const { data: analytics, isLoading: analyticsLoading } = useMentorAnalytics();
  const { data: sessions, isLoading: sessionsLoading } = useMentorSessions();
  const { data: requirements, isLoading: requirementsLoading } = useRequirements();

  const upcomingSessions = sessions?.filter((s: any) => s.status === 'CONFIRMED' || s.status === 'PENDING') || [];
  const recentSessions = sessions?.filter((s: any) => s.status === 'COMPLETED') || [];
  const recentRequirements = requirements?.slice(0, 3) || [];

  // Auto-refresh every 60 s (socket handles instant updates; this is a fallback)
  useAutoRefresh([['analytics', 'mentor'], ['sessions', 'mentor'], ['requirements']], 60_000);

  if (analyticsLoading || sessionsLoading || requirementsLoading) {
    return (
      <MentorLayout>
        <MentorDashboardSkeleton />
      </MentorLayout>
    );
  }

  return (
    <ErrorBoundary>
      <MentorLayout>
        <div className="p-6 md:p-8 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
              {user?.name?.split(' ').map(n => n[0]).join('') || 'M'}
            </div>
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0]}</h1>
              <p className="text-sm text-muted-foreground">Here's your mentoring overview</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2"><Bell className="h-4 w-4" /> Notifications</Button>
            <Link to="/mentor/profile/edit"><Button variant="outline" size="sm" className="gap-2">Edit Profile</Button></Link>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Earnings', value: `₹${Number(analytics?.totalEarnings || 0).toLocaleString('en-IN')}`, icon: IndianRupee, change: '+0%', positive: true },
            { label: 'Total Sessions', value: analytics?.totalSessions?.toString() || '0', icon: Video, change: '+0', positive: true },
            { label: 'Completed', value: analytics?.completedSessions?.toString() || '0', icon: TrendingUp, change: '+0', positive: true },
            { label: 'Upcoming', value: upcomingSessions.length.toString(), icon: Calendar, change: 'Sessions', positive: true },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}><CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Icon className="h-5 w-5 text-primary" /></div>
                  <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-600"><ArrowUpRight className="h-3 w-3" />{stat.change}</span>
                </div>
                <div className="text-2xl font-bold tabular-nums">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </CardContent></Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Learner Requests */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2"><Inbox className="h-5 w-5" /> Learner Requests</CardTitle>
                  <Link to="/mentor/requests" className="text-sm text-primary hover:underline">View All</Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentRequirements.map((req: any) => (
                  <div key={req.id} className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{req.title}</p>
                      <p className="text-xs text-muted-foreground">Budget: ₹{Number(req.budget || 0).toLocaleString('en-IN')} · By {req.learner?.user?.name}</p>
                    </div>
                    <Link to={`/mentor/requests/${req.id}`}><Button size="sm" variant="outline" className="text-xs">View</Button></Link>
                    <Link to={`/mentor/requests/${req.id}`}><Button size="sm" className="text-xs">Apply</Button></Link>
                  </div>
                ))}
                {recentRequirements.length === 0 && (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    No active learner requests.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Upcoming Sessions</CardTitle>
                  <Link to="/mentor/sessions" className="text-sm text-primary hover:underline flex items-center gap-1">View all <ChevronRight className="h-3 w-3" /></Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingSessions.map((session: any) => (
                  <div key={session.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                        {session.learner?.user?.name?.split(' ').map((n: string) => n[0]).join('') || 'L'}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{session.learner?.user?.name}</p>
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
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    No upcoming sessions.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-lg">Recent Sessions</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {recentSessions.map((session: any) => (
                  <div key={session.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center text-sm font-bold">
                        {session.learner?.user?.name?.split(' ').map((n: string) => n[0]).join('') || 'L'}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{session.learner?.user?.name}</p>
                        <p className="text-xs text-muted-foreground">Completed</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-accent tabular-nums">+₹{Number(session.earned || 0).toLocaleString('en-IN')}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(session.startTime), 'MMM d')}</p>
                    </div>
                  </div>
                ))}
                {recentSessions.length === 0 && (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    No recent sessions yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5" /> My Proposals</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <Link to="/mentor/proposals" className="text-sm text-primary hover:underline block mt-2">View All Proposals</Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-lg flex items-center gap-2"><Wallet className="h-5 w-5 text-primary" /> Payout</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground">Available to withdraw</p>
                  <p className="text-2xl font-bold tabular-nums">₹{Number(analytics?.totalEarnings || 0).toLocaleString('en-IN')}</p>
                </div>
                <Link to="/mentor/earnings"><Button variant="outline" className="w-full gap-2" size="sm"><IndianRupee className="h-4 w-4" /> View Earnings</Button></Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-lg">Quick Actions</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {[{ label: 'Manage Availability', icon: Calendar, to: '/mentor/availability' }, { label: 'Chat', icon: MessageSquare, to: '/mentor/chat' }, { label: 'Edit Profile', icon: Users, to: '/mentor/profile/edit' }].map(action => {
                  const Icon = action.icon;
                  return (
                    <Link key={action.label} to={action.to} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors text-sm font-medium">
                      <Icon className="h-4 w-4 text-muted-foreground" />{action.label}<ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                    </Link>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </MentorLayout>
    </ErrorBoundary>
  );
};

export default MentorDashboard;
