import { Card, CardContent, CardHeader } from '@/components/ui/card';

// Individual skeleton shimmer primitive
const Shimmer = ({ className = '' }: { className?: string }) => (
  <div
    className={`animate-pulse rounded-md bg-muted ${className}`}
    aria-hidden="true"
  />
);

// ─── Stat card row (4 cards) ──────────────────────────────────────────────────
export const StatCardsSkeleton = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    {Array.from({ length: 4 }).map((_, i) => (
      <Card key={i}>
        <CardContent className="p-5">
          <Shimmer className="w-10 h-10 rounded-lg mb-3" />
          <Shimmer className="h-8 w-24 mb-2" />
          <Shimmer className="h-3 w-20" />
        </CardContent>
      </Card>
    ))}
  </div>
);

// ─── Session list (3 rows) ────────────────────────────────────────────────────
export const SessionListSkeleton = () => (
  <Card>
    <CardHeader className="pb-3">
      <Shimmer className="h-5 w-40" />
    </CardHeader>
    <CardContent className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 rounded-xl border">
          <div className="flex items-center gap-4">
            <Shimmer className="w-10 h-10 rounded-full" />
            <div className="space-y-2">
              <Shimmer className="h-4 w-28" />
              <Shimmer className="h-3 w-16" />
            </div>
          </div>
          <div className="text-right space-y-2">
            <Shimmer className="h-4 w-24" />
            <Shimmer className="h-3 w-16" />
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
);

// ─── Full Mentor Dashboard skeleton ──────────────────────────────────────────
export const MentorDashboardSkeleton = () => (
  <div className="p-6 md:p-8 max-w-6xl">
    {/* Header */}
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <Shimmer className="w-14 h-14 rounded-xl" />
        <div className="space-y-2">
          <Shimmer className="h-6 w-48" />
          <Shimmer className="h-4 w-36" />
        </div>
      </div>
      <div className="flex gap-3">
        <Shimmer className="h-9 w-28 rounded-md" />
        <Shimmer className="h-9 w-28 rounded-md" />
      </div>
    </div>

    <StatCardsSkeleton />

    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <SessionListSkeleton />
        <SessionListSkeleton />
      </div>
      <div className="space-y-6">
        <Card>
          <CardContent className="p-5 space-y-3">
            <Shimmer className="h-5 w-32" />
            <Shimmer className="h-8 w-28" />
            <Shimmer className="h-9 w-full rounded-md" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Shimmer key={i} className="h-11 w-full rounded-lg" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

// ─── Full Learner Dashboard skeleton ─────────────────────────────────────────
export const LearnerDashboardSkeleton = () => (
  <div className="p-6 md:p-8 max-w-6xl">
    <div className="flex items-center justify-between mb-8">
      <div className="space-y-2">
        <Shimmer className="h-7 w-56" />
        <Shimmer className="h-4 w-40" />
      </div>
      <div className="flex gap-3">
        <Shimmer className="h-9 w-28 rounded-md" />
        <Shimmer className="h-9 w-32 rounded-md" />
      </div>
    </div>

    <StatCardsSkeleton />

    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <SessionListSkeleton />
        <SessionListSkeleton />
      </div>
      <div className="space-y-6">
        <Card>
          <CardContent className="p-5 space-y-3">
            <Shimmer className="h-5 w-32" />
            <Shimmer className="h-12 w-full rounded-lg" />
            <Shimmer className="h-8 w-36" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 space-y-3">
            <Shimmer className="h-5 w-24" />
            <Shimmer className="h-8 w-28" />
            <Shimmer className="h-9 w-full rounded-md" />
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

// ─── Generic card skeleton (reusable) ────────────────────────────────────────
export const CardSkeleton = ({ rows = 3 }: { rows?: number }) => (
  <Card>
    <CardHeader className="pb-3">
      <Shimmer className="h-5 w-40" />
    </CardHeader>
    <CardContent className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Shimmer key={i} className="h-16 w-full rounded-lg" />
      ))}
    </CardContent>
  </Card>
);
