import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  ShieldCheck, Users, Briefcase, Wallet, Search,
  X, CheckCircle, Clock, AlertCircle, RefreshCw,
  ChevronDown, ChevronUp, Download, Mail, Phone,
  Calendar, TrendingUp, Star, UserCheck, Eye,
  Award, MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import api from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow, format } from 'date-fns';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Mentor {
  id: string;
  userId: string;
  user: { id: string; name: string; email: string; profilePicture?: string; createdAt: string };
  title: string;
  bio: string;
  expertise: string[];
  experience: number;
  hourlyRate: number;
  totalSessions: number;
  averageRating: number;
  totalEarnings: number;
  createdAt: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationDetails?: { rejectionReason?: string | null };
}

interface Stats {
  users: { total: number; active: number; newThisMonth: number; growth: number };
  mentors: { total: number; verified: number; pending: number; rejected: number; active: number; growth: number };
  sessions: { total: number; completed: number; cancelled: number; thisMonth: number; growth: number };
  earnings: { total: number; platformFee: number; mentorPayout: number; thisMonth: number; growth: number };
  reviews: { total: number; averageRating: number; fiveStar: number };
}

type TabStatus = 'pending' | 'verified' | 'rejected' | 'all';
type SortBy = 'newest' | 'oldest' | 'name' | 'experience' | 'rating' | 'earnings';

// ─── Utilities ────────────────────────────────────────────────────────────────
const fmt = (v: unknown): string => {
  const n = typeof v === 'string' ? parseFloat(v) : Number(v ?? 0);
  return `₹${(isNaN(n) ? 0 : n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};
const fmtNum = (v: unknown): string => {
  const n = Number(v ?? 0);
  return isNaN(n) ? '0' : n.toLocaleString('en-IN');
};
const initials = (name: string) =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

const defaultStats: Stats = {
  users: { total: 0, active: 0, newThisMonth: 0, growth: 0 },
  mentors: { total: 0, verified: 0, pending: 0, rejected: 0, active: 0, growth: 0 },
  sessions: { total: 0, completed: 0, cancelled: 0, thisMonth: 0, growth: 0 },
  earnings: { total: 0, platformFee: 0, mentorPayout: 0, thisMonth: 0, growth: 0 },
  reviews: { total: 0, averageRating: 0, fiveStar: 0 },
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
  if (status === 'verified')
    return <Badge className="bg-green-500 hover:bg-green-600 text-white"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>;
  if (status === 'pending')
    return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
  return <Badge className="bg-red-500 hover:bg-red-600 text-white"><X className="h-3 w-3 mr-1" />Rejected</Badge>;
};

interface StatCardProps {
  title: string; value: string; subValue?: string;
  icon: React.ElementType; trend?: number; loading?: boolean; colorClass: string;
}
const StatCard = ({ title, value, subValue, icon: Icon, trend, loading, colorClass }: StatCardProps) => (
  <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/40 backdrop-blur-sm rounded-2xl">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
      <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</CardTitle>
      <div className={`p-2.5 rounded-xl shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3 ${colorClass} bg-gradient-to-br from-white/20 to-transparent`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
    </CardHeader>
    <CardContent>
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-3 w-32 rounded-lg" />
        </div>
      ) : (
        <>
          <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{value}</div>
          {subValue && (
            <p className="text-[11px] font-medium text-muted-foreground mt-1 flex items-center gap-1.5 capitalize">
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
              {subValue}
            </p>
          )}
          {trend !== undefined && trend !== 0 && (
            <div className="flex items-center mt-4">
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${trend > 0 ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                {trend > 0 ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {Math.abs(trend)}%
              </div>
              <span className="text-[10px] ml-2 font-medium text-slate-400">vs last month</span>
            </div>
          )}
        </>
      )}
    </CardContent>
  </Card>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminDashboard = ({ initialTab }: { initialTab?: TabStatus }) => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [stats, setStats] = useState<Stats>(defaultStats);
  const [loading, setLoading] = useState({ mentors: true, stats: true, verify: false, reject: false });
  const [activeTab, setActiveTab] = useState<TabStatus>(initialTab || 'pending');
  const [search, setSearch] = useState('');
  const [expertise, setExpertise] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [showVerify, setShowVerify] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const { toast } = useToast();

  // ── Data fetching ────────────────────────────────────────────────────────────
  const fetchMentors = useCallback(async () => {
    setLoading((p) => ({ ...p, mentors: true }));
    try {
      const params = new URLSearchParams();
      if (activeTab !== 'all') params.append('status', activeTab);
      const res = await api.get(`/users/mentors-list?${params}`);
      setMentors(res.data.data ?? []);
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.message || 'Failed to fetch mentors.', variant: 'destructive' });
    } finally {
      setLoading((p) => ({ ...p, mentors: false }));
    }
  }, [activeTab, toast]);

  const fetchStats = useCallback(async () => {
    setLoading((p) => ({ ...p, stats: true }));
    try {
      const res = await api.get('/users/stats');
      setStats(res.data.data ?? defaultStats);
    } catch {
      // stats failure is non-critical; keep prev values
    } finally {
      setLoading((p) => ({ ...p, stats: false }));
    }
  }, []);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => { fetchMentors(); }, [fetchMentors]);
  useEffect(() => {
    fetchStats();
    const id = setInterval(fetchStats, 30_000);
    return () => clearInterval(id);
  }, [fetchStats]);

  // ── Client-side filter + sort ─────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...mentors];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((m) =>
        m.user.name.toLowerCase().includes(q) ||
        m.user.email.toLowerCase().includes(q) ||
        m.title.toLowerCase().includes(q) ||
        m.bio.toLowerCase().includes(q),
      );
    }
    if (expertise) {
      const q = expertise.toLowerCase();
      list = list.filter((m) => m.expertise.some((e) => e.toLowerCase().includes(q)));
    }
    list.sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.user.name.localeCompare(b.user.name);
        case 'experience': return b.experience - a.experience;
        case 'rating': return (b.averageRating || 0) - (a.averageRating || 0);
        case 'earnings': return (b.totalEarnings || 0) - (a.totalEarnings || 0);
        case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    return list;
  }, [mentors, search, expertise, sortBy]);

  // ── Actions ──────────────────────────────────────────────────────────────────
  const handleVerify = async () => {
    if (!selectedMentor) return;
    setLoading((p) => ({ ...p, verify: true }));
    try {
      await api.post(`/users/verify-mentor/${selectedMentor.id}`);
      toast({ title: '✅ Mentor Verified', description: `${selectedMentor.user.name} is now a verified mentor.` });
      setShowVerify(false);
      setSelectedMentor(null);
      fetchMentors(); fetchStats();
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.message || 'Verification failed.', variant: 'destructive' });
    } finally {
      setLoading((p) => ({ ...p, verify: false }));
    }
  };

  const handleReject = async () => {
    if (!selectedMentor) return;
    if (!rejectionReason.trim()) {
      toast({ title: 'Required', description: 'Please provide a reason for rejection.', variant: 'destructive' });
      return;
    }
    setLoading((p) => ({ ...p, reject: true }));
    try {
      await api.post(`/users/reject-mentor/${selectedMentor.id}`, { reason: rejectionReason.trim() });
      toast({ title: 'Application Rejected', description: `${selectedMentor.user.name}'s application has been declined.` });
      setShowReject(false);
      setSelectedMentor(null);
      setRejectionReason('');
      fetchMentors(); fetchStats();
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.message || 'Rejection failed.', variant: 'destructive' });
    } finally {
      setLoading((p) => ({ ...p, reject: false }));
    }
  };

  const handleExport = () => {
    if (filtered.length === 0) { toast({ title: 'Nothing to export', description: 'No mentors match the current filters.' }); return; }
    const headers = ['Name', 'Email', 'Title', 'Experience (yrs)', 'Hourly Rate', 'Sessions', 'Rating', 'Status', 'Applied'];
    const rows = filtered.map((m) => [
      m.user.name, m.user.email, m.title, m.experience,
      m.hourlyRate, m.totalSessions, m.averageRating,
      m.verificationStatus, format(new Date(m.createdAt), 'yyyy-MM-dd'),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `mentors-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast({ title: 'Exported', description: `${filtered.length} mentors exported as CSV.` });
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <TooltipProvider>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200/60 dark:border-slate-800/60 pb-6 mb-8">
          <div className="hidden lg:block">
            <h2 className="text-xl font-semibold tracking-tight text-slate-800 dark:text-slate-100">Performance Summary</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Real-time statistics of the platforms ecosystem</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" /> Export CSV
            </Button>
            <Button variant="ghost" size="icon" onClick={() => { fetchMentors(); fetchStats(); }}
              disabled={loading.mentors || loading.stats}>
              <RefreshCw className={`h-4 w-4 ${(loading.mentors || loading.stats) ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Primary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Users" value={fmtNum(stats.users.total)}
            subValue={`${fmtNum(stats.users.active)} active`}
            icon={Users} trend={stats.users.growth} loading={loading.stats} colorClass="bg-blue-500" />
          <StatCard title="Total Mentors" value={fmtNum(stats.mentors.total)}
            subValue={`${fmtNum(stats.mentors.verified)} verified`}
            icon={Briefcase} trend={stats.mentors.growth} loading={loading.stats} colorClass="bg-purple-500" />
          <StatCard title="Completed Sessions" value={fmtNum(stats.sessions.completed)}
            subValue={`${fmtNum(stats.sessions.thisMonth)} this month`}
            icon={Calendar} trend={stats.sessions.growth} loading={loading.stats} colorClass="bg-green-500" />
          <StatCard title="Total Revenue" value={fmt(stats.earnings.total)}
            subValue={`Platform fee: ${fmt(stats.earnings.platformFee)}`}
            icon={Wallet} trend={stats.earnings.growth} loading={loading.stats} colorClass="bg-yellow-500" />
        </div>

        {/* Secondary Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm opacity-90">Pending Verifications</p>
                  <p className="text-3xl font-bold mt-2">{fmtNum(stats.mentors.pending)}</p>
                  <p className="text-xs mt-2 opacity-80">Awaiting admin review</p>
                </div>
                <UserCheck className="h-8 w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm opacity-90">Average Rating</p>
                  <p className="text-3xl font-bold mt-2">{stats.reviews.averageRating.toFixed(1)} ★</p>
                  <p className="text-xs mt-2 opacity-80">Based on {fmtNum(stats.reviews.total)} reviews</p>
                </div>
                <Star className="h-8 w-8 opacity-80" />
              </div>
              <Progress
                value={stats.reviews.total ? (stats.reviews.fiveStar / stats.reviews.total) * 100 : 0}
                className="mt-3 bg-white/30 [&>div]:bg-yellow-400"
              />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm opacity-90">Mentor Payouts</p>
                  <p className="text-3xl font-bold mt-2">{fmt(stats.earnings.mentorPayout)}</p>
                  <p className="text-xs mt-2 opacity-80">Total paid to mentors</p>
                </div>
                <Award className="h-8 w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mentor Management */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle className="text-xl">Mentor Applications</CardTitle>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabStatus)}>
                <TabsList>
                  <TabsTrigger value="pending">
                    Pending
                    {stats.mentors.pending > 0 && (
                      <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        {stats.mentors.pending}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="verified">Verified</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                  <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by name, email, title…" value={search}
                  onChange={(e) => setSearch(e.target.value)} className="pl-10" />
              </div>
              <Input placeholder="Filter by expertise" value={expertise}
                onChange={(e) => setExpertise(e.target.value)} className="w-48" />
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="experience">Experience</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="earnings">Earnings</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* List */}
            <div className="space-y-4">
              {loading.mentors ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4 border rounded-lg space-y-3">
                    <div className="flex gap-3">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-4 w-64" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-8 w-20" />
                    </div>
                  </div>
                ))
              ) : filtered.length === 0 ? (
                <div className="text-center py-14">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No mentors found matching your criteria.</p>
                  <Button variant="link" onClick={() => { setSearch(''); setExpertise(''); setActiveTab('all'); }} className="mt-2">
                    Clear filters
                  </Button>
                </div>
              ) : (
                filtered.map((mentor) => (
                  <div key={mentor.id} className="border rounded-xl hover:shadow-md transition-all duration-200 overflow-hidden">
                    <div className="p-4">
                      <div className="flex flex-col md:flex-row items-start gap-4">
                        {/* Left: Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3">
                            <Avatar className="h-12 w-12 shrink-0">
                              <AvatarImage src={mentor.user.profilePicture ? `http://localhost:3000${mentor.user.profilePicture}` : undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {initials(mentor.user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-base">{mentor.user.name}</h3>
                                <StatusBadge status={mentor.verificationStatus} />
                              </div>
                              <p className="text-sm text-muted-foreground truncate">{mentor.user.email}</p>
                            </div>
                          </div>

                          <p className="font-medium text-primary text-sm">{mentor.title}</p>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{mentor.bio}</p>

                          <div className="flex flex-wrap gap-4 mt-3 text-sm">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1 cursor-default">
                                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                  <span className="font-medium">{mentor.averageRating?.toFixed(1) || 'N/A'}</span>
                                  <span className="text-muted-foreground">({mentor.totalSessions} sessions)</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>Average Rating</TooltipContent>
                            </Tooltip>

                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Briefcase className="h-4 w-4" />
                              <span>{mentor.experience}+ yrs exp</span>
                            </div>

                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Wallet className="h-4 w-4" />
                              <span className="font-medium">{fmt(mentor.hourlyRate)}/hr</span>
                            </div>

                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>Applied {formatDistanceToNow(new Date(mentor.createdAt))} ago</span>
                            </div>

                            {mentor.totalEarnings > 0 && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Award className="h-4 w-4" />
                                <span>Earned: {fmt(mentor.totalEarnings)}</span>
                              </div>
                            )}
                          </div>

                          {mentor.expertise.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {mentor.expertise.slice(0, 6).map((exp, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">{exp}</Badge>
                              ))}
                              {mentor.expertise.length > 6 && (
                                <Badge variant="outline" className="text-xs">+{mentor.expertise.length - 6} more</Badge>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Right: Actions */}
                        <div className="flex flex-row md:flex-col gap-2 shrink-0">
                          {mentor.verificationStatus === 'pending' && (
                            <>
                              <Button size="sm" className="gap-2 bg-green-600 hover:bg-green-700"
                                disabled={loading.verify}
                                onClick={() => { setSelectedMentor(mentor); setShowVerify(true); }}>
                                <ShieldCheck className="h-4 w-4" /> Verify
                              </Button>
                              <Button size="sm" variant="destructive" className="gap-2"
                                disabled={loading.reject}
                                onClick={() => { setSelectedMentor(mentor); setShowReject(true); }}>
                                <X className="h-4 w-4" /> Reject
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="outline" className="gap-2"
                            onClick={() => setExpandedId(expandedId === mentor.id ? null : mentor.id)}>
                            <Eye className="h-4 w-4" />
                            {expandedId === mentor.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      {/* Expanded panel */}
                      {expandedId === mentor.id && (
                        <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                              <Mail className="h-4 w-4" /> Contact
                            </h4>
                            <div className="space-y-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2"><Mail className="h-4 w-4" />{mentor.user.email}</div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-3 text-sm">Performance</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Sessions</span>
                                <span className="font-medium">{mentor.totalSessions}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Earned</span>
                                <span className="font-medium">{fmt(mentor.totalEarnings)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Avg Rating</span>
                                <span className="font-medium">{mentor.averageRating?.toFixed(1) || 'N/A'}</span>
                              </div>
                              <Progress value={(mentor.averageRating / 5) * 100} className="mt-1" />
                            </div>
                          </div>

                          {mentor.verificationDetails?.rejectionReason && (
                            <div className="md:col-span-2">
                              <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                  <strong>Rejection Reason:</strong> {mentor.verificationDetails.rejectionReason}
                                </AlertDescription>
                              </Alert>
                            </div>
                          )}

                          {mentor.verificationStatus === 'rejected' && (
                            <div className="md:col-span-2">
                              <Button size="sm" className="gap-2 bg-green-600 hover:bg-green-700"
                                onClick={() => { setSelectedMentor(mentor); setShowVerify(true); }}>
                                <ShieldCheck className="h-4 w-4" /> Re-verify This Mentor
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {!loading.mentors && filtered.length > 0 && (
              <p className="text-xs text-muted-foreground text-right mt-4">
                Showing {filtered.length} mentor{filtered.length !== 1 ? 's' : ''}
              </p>
            )}
          </CardContent>
        </Card>

        {/* ── Verify Dialog ─────────────────────────────────────────────────── */}
        <Dialog open={showVerify} onOpenChange={setShowVerify}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-green-600" /> Verify Mentor
              </DialogTitle>
              <DialogDescription>
                You are about to verify <strong>{selectedMentor?.user.name}</strong>. They will gain full
                platform access and can start accepting session bookings.
              </DialogDescription>
            </DialogHeader>
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 text-sm text-green-800 dark:text-green-200">
              ✅ This will mark the mentor as verified and notify them via email.
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowVerify(false)}>Cancel</Button>
              <Button onClick={handleVerify} disabled={loading.verify}
                className="bg-green-600 hover:bg-green-700 gap-2">
                {loading.verify ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                Confirm Verification
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Reject Dialog ─────────────────────────────────────────────────── */}
        <Dialog open={showReject} onOpenChange={(open) => { setShowReject(open); if (!open) setRejectionReason(''); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <X className="h-5 w-5 text-destructive" /> Reject Application
              </DialogTitle>
              <DialogDescription>
                Rejecting <strong>{selectedMentor?.user.name}</strong>'s mentor application. Please provide
                a clear reason — it will be stored for audit purposes.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <label className="text-sm font-medium">Rejection Reason <span className="text-destructive">*</span></label>
              <Textarea
                placeholder="e.g. Incomplete profile, insufficient experience documentation…"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">{rejectionReason.length}/500 characters</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowReject(false); setRejectionReason(''); }}>Cancel</Button>
              <Button variant="destructive" onClick={handleReject}
                disabled={loading.reject || !rejectionReason.trim()} className="gap-2">
                {loading.reject ? <RefreshCw className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                Confirm Rejection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </TooltipProvider>
  );
};

export default AdminDashboard;
