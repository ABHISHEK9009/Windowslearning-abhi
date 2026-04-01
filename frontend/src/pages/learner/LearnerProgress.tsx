import { Link } from 'react-router-dom';
import { TrendingUp, BookOpen, Award, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import LearnerLayout from '@/components/LearnerLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useLearnerAnalytics, useLearnerSessions } from '@/hooks/useApi';
import { formatDistanceToNow } from 'date-fns';
import { useMemo } from 'react';

type LearnerSession = {
  status?: string;
  topic?: string | null;
  startTime?: string | Date | null;
};

type LearnerSkillLink = {
  skill?: { name?: string | null } | null;
  name?: string | null;
};

type UserWithLearnerProfile = {
  learnerProfile?: {
    skills?: LearnerSkillLink[] | null;
    experienceLevel?: string | null;
  } | null;
} | null;

const LearnerProgress = () => {
  const { user } = useAuth();
  const { data: analytics, isLoading: analyticsLoading } = useLearnerAnalytics();
  const { data: sessions = [], isLoading: sessionsLoading } = useLearnerSessions();

  const typedSessions = useMemo(() => sessions as unknown as LearnerSession[], [sessions]);

  const completedSessions = useMemo(
    () => typedSessions.filter((s) => s?.status === 'COMPLETED'),
    [typedSessions]
  );

  const overallProgress = useMemo(() => {
    const total = analytics?.totalSessions ?? sessions.length ?? 0;
    const completed = analytics?.completedSessions ?? completedSessions.length ?? 0;
    if (!total) return 0;
    return Math.round((completed / total) * 100);
  }, [analytics?.totalSessions, analytics?.completedSessions, sessions.length, completedSessions.length]);

  const learnerProfile = (user as unknown as UserWithLearnerProfile)?.learnerProfile ?? null;
  const learnerSkills = useMemo(() => learnerProfile?.skills ?? [], [learnerProfile]);

  const skillsProgress = useMemo(() => {
    const totalCompleted = completedSessions.length || 0;
    return learnerSkills.map((ls) => {
      const skillName = ls.skill?.name ?? ls.name ?? 'Skill';
      const matches = totalCompleted
        ? completedSessions.filter((s) =>
            String(s?.topic ?? '').toLowerCase().includes(skillName.toLowerCase())
          )
        : [];

      const matchedCount = matches.length;
      const progress = totalCompleted ? Math.round((matchedCount / totalCompleted) * 100) : 0;

      return {
        name: skillName,
        progress,
        hours: matchedCount, // session-topic matches as a rough proxy
        modules: `${matchedCount}/${Math.max(1, Math.min(10, matchedCount + 3))}`,
        lastStudied: matches.length ? matches[matches.length - 1]?.startTime : null,
      };
    });
  }, [learnerSkills, completedSessions]);

  const experienceLevel = learnerProfile?.experienceLevel ?? 'Beginner';
  const savedSkillsCount = learnerSkills.length;
  const paths = useMemo(() => {
    const completedCount = completedSessions.length;
    const denom = Math.max(1, savedSkillsCount);

    return [
      {
        name: 'Your Learning Journey',
        level: experienceLevel,
        skills: savedSkillsCount,
        completed: Math.min(completedCount, denom),
        progress: overallProgress,
      },
      {
        name: 'Focus on What Moves the Needle',
        level: 'Adaptive',
        skills: savedSkillsCount,
        completed: Math.min(completedCount, denom),
        progress: Math.max(0, Math.min(100, Math.round(overallProgress * 0.75))),
      },
    ];
  }, [completedSessions.length, experienceLevel, savedSkillsCount, overallProgress]);

  if (analyticsLoading || sessionsLoading) {
    return (
      <LearnerLayout>
        <div className="p-6 md:p-8 flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </LearnerLayout>
    );
  }

  return (
    <LearnerLayout>
      <div className="p-6 md:p-8 max-w-5xl">
        <h1 className="text-2xl font-bold mb-1">Progress Tracker</h1>
        <p className="text-muted-foreground mb-6">Track your learning journey</p>

        {/* Overall */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">Overall Progress</h3>
                <p className="text-sm text-muted-foreground">
                  Completion based on your recorded sessions
                </p>
              </div>
              <div className="text-3xl font-bold text-primary">{overallProgress}%</div>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </CardContent>
        </Card>

        {/* Skills */}
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><BookOpen className="h-5 w-5" /> Skills Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {skillsProgress.length ? (
            skillsProgress.map(skill => (
              <Card key={skill.name} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{skill.name}</h4>
                  <span className="text-sm font-semibold text-primary">{skill.progress}%</span>
                </div>
                <Progress value={skill.progress} className="h-2 mb-3" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{skill.hours} sessions</span>
                  <span>{skill.modules} modules</span>
                </div>
                <Link to={`/mentors?skill=${skill.name.toLowerCase()}`}>
                  <Button variant="ghost" size="sm" className="mt-3 gap-1 text-xs">Continue Learning <ChevronRight className="h-3 w-3" /></Button>
                </Link>
                {skill.lastStudied && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Last studied {formatDistanceToNow(new Date(skill.lastStudied), { addSuffix: true })}
                  </p>
                )}
              </CardContent>
            </Card>
            ))
          ) : (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Add skills to your learner profile to see skill progress here.
            </div>
          )}
        </div>

        {/* Learning Paths */}
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Learning Paths</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {paths.map(path => (
            <Card key={path.name}>
              <CardContent className="p-5">
                <h4 className="font-medium mb-1">{path.name}</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  {path.level} · {path.completed} milestones
                </p>
                <Progress value={path.progress} className="h-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Certificates */}
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Award className="h-5 w-5" /> Certificates</h2>
        <Card>
          <CardContent className="p-8 text-center">
            <Award className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Complete a learning path to earn your first certificate!</p>
          </CardContent>
        </Card>
      </div>
    </LearnerLayout>
  );
};

export default LearnerProgress;
