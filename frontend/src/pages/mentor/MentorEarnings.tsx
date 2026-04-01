import { DollarSign, TrendingUp, Download, ArrowUpRight, ArrowDownLeft, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MentorLayout from '@/components/MentorLayout';
import { useMentorAnalytics, useMentorSessions } from '@/hooks/useApi';
import { format } from 'date-fns';

const MentorEarnings = () => {
  const { data: analytics, isLoading: analyticsLoading } = useMentorAnalytics();
  const { data: sessions, isLoading: sessionsLoading } = useMentorSessions();

  if (analyticsLoading || sessionsLoading) {
    return (
      <MentorLayout>
        <div className="p-6 md:p-8 flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MentorLayout>
    );
  }

  const completedSessions = sessions?.filter((s: any) => s.status === 'COMPLETED') || [];

  return (
    <MentorLayout>
      <div className="p-6 md:p-8 max-w-5xl">
        <h1 className="text-2xl font-bold mb-1">Earnings</h1>
        <p className="text-muted-foreground mb-6">Track your income and payouts</p>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Total Earnings</p>
              <p className="text-2xl font-bold mt-1">₹{Number(analytics?.totalEarnings || 0).toLocaleString('en-IN')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Completed Sessions</p>
              <p className="text-2xl font-bold mt-1 text-accent">{analytics?.completedSessions || '0'}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
            <CardContent className="p-5">
              <p className="text-sm opacity-80">Available to Withdraw</p>
              <p className="text-2xl font-bold mt-1">₹{Number(analytics?.totalEarnings || 0).toLocaleString('en-IN')}</p>
              <Button variant="secondary" size="sm" className="mt-2">Withdraw</Button>
            </CardContent>
          </Card>
        </div>

        {/* Payout Settings */}
        <Card className="mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Payout Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">Add Bank Account</p>
                <p className="text-xs text-muted-foreground">Prizes will be transferred to your bank account</p>
              </div>
              <Button variant="outline" size="sm">Add</Button>
            </div>
          </CardContent>
        </Card>

        {/* Transactions */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Session History</CardTitle>
              <Button variant="outline" size="sm" className="gap-1"><Download className="h-3 w-3" /> Export</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedSessions.map((session: any) => (
                <div key={session.id} className="flex items-center gap-3 py-3 border-b last:border-0">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-accent/10 text-accent">
                    <ArrowDownLeft className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">Session with {session.learner?.user?.name}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(session.startTime), 'MMM d, yyyy')} · {session.status}</p>
                  </div>
                  <span className="text-sm font-semibold text-accent">
                    +₹{Number(session.earned || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
              {completedSessions.length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No completed sessions yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MentorLayout>
  );
};

export default MentorEarnings;
