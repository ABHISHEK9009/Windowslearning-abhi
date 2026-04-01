import { useEffect, useState } from 'react';
import { Clock, CalendarDays, Globe, Plus, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import MentorLayout from '@/components/MentorLayout';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const MentorAvailability = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [acceptingSessions, setAcceptingSessions] = useState(true);
  const [schedule, setSchedule] = useState<Record<string, { active: boolean; start: string; end: string }>>(
    Object.fromEntries(days.map(day => [day, { active: false, start: '09:00', end: '18:00' }]))
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.mentorProfile?.availability) {
      const newSchedule = { ...schedule };
      user.mentorProfile.availability.forEach((avail: any) => {
        newSchedule[avail.day] = { active: avail.isAvailable, start: avail.startTime, end: avail.endTime };
      });
      setSchedule(newSchedule);
    }
  }, [user]);

  const toggleDay = (day: string) => {
    setSchedule(prev => ({ ...prev, [day]: { ...prev[day], active: !prev[day].active } }));
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      await api.patch('/mentors/availability', { schedule });
      toast({
        title: 'Availability Updated',
        description: 'Your schedule has been successfully updated.',
      });
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'There was an error updating your availability.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MentorLayout>
      <div className="p-6 md:p-8 max-w-4xl">
        <h1 className="text-2xl font-bold mb-1">Availability</h1>
        <p className="text-muted-foreground mb-6">Manage your schedule and time off</p>

        {/* Status Toggle */}
        <Card className="mb-6">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="font-medium">Accepting New Sessions</p>
              <p className="text-sm text-muted-foreground">Toggle off to pause new bookings</p>
            </div>
            <Switch checked={acceptingSessions} onCheckedChange={setAcceptingSessions} />
          </CardContent>
        </Card>

        {/* Weekly Schedule */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2"><CalendarDays className="h-5 w-5" /> Weekly Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {days.map(day => (
                <div key={day} className="flex items-center gap-4 py-2">
                  <div className="w-28">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={schedule[day].active} onChange={() => toggleDay(day)} className="rounded border-border" />
                      <span className={`text-sm font-medium ${schedule[day].active ? '' : 'text-muted-foreground'}`}>{day}</span>
                    </label>
                  </div>
                  {schedule[day].active ? (
                    <div className="flex items-center gap-2 text-sm">
                      <input type="time" aria-label="Start time" value={schedule[day].start} onChange={e => setSchedule(prev => ({ ...prev, [day]: { ...prev[day], start: e.target.value } }))} className="h-9 px-3 rounded-lg border bg-background text-sm" />
                      <span className="text-muted-foreground">to</span>
                      <input type="time" aria-label="End time" value={schedule[day].end} onChange={e => setSchedule(prev => ({ ...prev, [day]: { ...prev[day], end: e.target.value } }))} className="h-9 px-3 rounded-lg border bg-background text-sm" />
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Unavailable</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex gap-3">
          <Button onClick={handleSaveChanges} disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Changes'}</Button>
          <Button variant="outline" disabled={isLoading}>Cancel</Button>
        </div>
      </div>
    </MentorLayout>
  );
};

export default MentorAvailability;
