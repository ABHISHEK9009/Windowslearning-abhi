import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle, XCircle, MessageSquare, Video } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MentorLayout from '@/components/MentorLayout';

import { useMentorProposals } from '@/hooks/useApi';

const MentorProposals = () => {
  const [tab, setTab] = useState<'pending' | 'accepted' | 'rejected'>('pending');
  const { data: proposals = [], isLoading } = useMentorProposals();

  const filteredProposals = proposals.filter((p: any) => {
    if (tab === 'pending') return !p.isAccepted && !p.isRejected; // Assuming isRejected field or status
    if (tab === 'accepted') return p.isAccepted;
    return p.isRejected;
  });

  const tabs: { key: 'pending' | 'accepted' | 'rejected'; label: string; count: number; icon: any }[] = [
    { key: 'pending', label: 'Pending', count: proposals.filter((p: any) => !p.isAccepted && !p.isRejected).length, icon: Clock },
    { key: 'accepted', label: 'Accepted', count: proposals.filter((p: any) => p.isAccepted).length, icon: CheckCircle },
    { key: 'rejected', label: 'Rejected', count: proposals.filter((p: any) => p.isRejected).length, icon: XCircle },
  ];

  return (
    <MentorLayout>
      <div className="p-6 md:p-8 max-w-5xl">
        <h1 className="text-2xl font-bold mb-1">My Proposals</h1>
        <p className="text-muted-foreground mb-6">Track your proposal submissions</p>

        <div className="flex gap-1 mb-6 bg-secondary rounded-lg p-1">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${tab === t.key ? 'bg-card shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProposals.map((p: any) => (
              <Card key={p.id}>
                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <p className="font-semibold">{p.requirement?.title || 'Project Proposal'}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Bid: ₹{Number(p.proposedRate || 0).toLocaleString()} · Submitted: {new Date(p.createdAt).toLocaleDateString()}
                    </p>
                    {tab === 'accepted' && (
                      <p className="text-xs text-accent font-medium mt-1">Learner: {p.requirement?.learner?.user?.name}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {tab === 'pending' && <Button variant="destructive" size="sm">Withdraw</Button>}
                    {tab === 'accepted' && (
                      <>
                        <Button variant="outline" size="sm" className="gap-1"><MessageSquare className="h-3 w-3" /> Message</Button>
                        <Button size="sm" className="gap-1"><Video className="h-3 w-3" /> Start Session</Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredProposals.length === 0 && (
              <div className="text-center py-20 text-muted-foreground">
                No {tab} proposals found.
              </div>
            )}
          </div>
        )}
      </div>
    </MentorLayout>
  );
};

export default MentorProposals;
