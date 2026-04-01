import { Star, CheckCircle, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Mentor } from '@/data/types';

interface MentorCardProps {
  mentor: Mentor;
  index?: number;
  isVisible?: boolean;
}

const MentorCard = ({ mentor, index = 0, isVisible = true }: MentorCardProps) => {
  const name = mentor.user?.name || mentor.name || 'Mentor';
  const initials = name.split(' ').map((n: string) => n[0]).join('');
  const expertise = mentor.skills?.map((s: any) => s.skill?.name) || mentor.expertise || [];
  const rating = mentor.reviews?.length > 0 
    ? (mentor.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / mentor.reviews.length).toFixed(1)
    : mentor.rating?.toFixed(1) || '0.0';
  const reviewCount = mentor.reviews?.length || mentor.reviewCount || 0;
  const chatUserId = mentor.userId || mentor.id;

  return (
    <div
      className={`group block bg-card rounded-xl border overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 active:scale-[0.98] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
      style={{ transitionDelay: isVisible ? `${index * 100}ms` : '0ms' }}
    >
      {/* Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-base font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <Link
                to={`/mentor/${mentor.id}`}
                className="text-sm font-semibold truncate hover:underline"
              >
                {name}
              </Link>
              {chatUserId ? (
                <Link
                  to={`/chat/${chatUserId}`}
                  className="chat-cta"
                  aria-label="Chat"
                  title="Chat"
                >
                  <MessageSquare className="h-4 w-4" />
                </Link>
              ) : null}
              {mentor.isVerified && (
                <CheckCircle className="h-4 w-4 text-accent shrink-0" />
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate mt-0.5">{mentor.bio || 'Professional Mentor'}</p>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="px-5 pb-3">
        <div className="flex flex-wrap gap-1.5">
          {expertise.slice(0, 3).map((skill: string) => (
            <span key={skill} className="px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3.5 border-t bg-secondary/30 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-semibold tabular-nums">{rating}</span>
          <span className="text-xs text-muted-foreground">({reviewCount})</span>
        </div>
        <div className="text-right flex items-end gap-2">
          <div>
            <span className="text-sm font-bold">₹{Number(mentor.hourlyRate || 0).toLocaleString('en-IN')}</span>
            <span className="text-xs text-muted-foreground">/hr</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorCard;
