import { Link } from 'react-router-dom';
import { Inbox, Clock, DollarSign, MapPin, ChevronRight, Filter, IndianRupee } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MentorLayout from '@/components/MentorLayout';

import { useRequirements } from '@/hooks/useApi';

const MentorRequests = () => {
  const { data: requirements = [], isLoading } = useRequirements();

  return (
    <MentorLayout>
      <div className="p-6 md:p-8 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Learner Requests</h1>
            <p className="text-muted-foreground">Browse and apply to learning requests</p>
          </div>
          <Button variant="outline" size="sm" className="gap-1"><Filter className="h-3 w-3" /> Filters</Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {requirements.map((req: any) => (
              <Card key={req.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <Link to={`/mentor/requests/${req.id}`} className="font-semibold hover:text-primary">{req.title}</Link>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{req.description}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {req.skills?.map((s: any) => <Badge key={s.id} variant="secondary" className="text-xs">{s.skill?.name || s}</Badge>)}
                      </div>
                      <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><IndianRupee className="h-3 w-3" />{Number(req.budget || 0).toLocaleString('en-IN')}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />Online</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Created: {new Date(req.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Link to={`/mentor/requests/${req.id}`}>
                        <Button variant="outline" size="sm">View Details</Button>
                      </Link>
                      <Button size="sm">Submit Proposal</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {requirements.length === 0 && (
              <div className="text-center py-20 text-muted-foreground">
                No learning requests found.
              </div>
            )}
          </div>
        )}
      </div>
    </MentorLayout>
  );
};

export default MentorRequests;
