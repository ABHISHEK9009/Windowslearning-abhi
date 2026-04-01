import React, { useState } from 'react';
import { Star, ThumbsUp, MessageSquare, CheckCircle, Calendar, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Card, CardContent } from './ui/card';
import { formatDistanceToNow } from 'date-fns';

interface Review {
  id: string;
  sessionId: string;
  mentorId: string;
  learnerId: string;
  learnerName: string;
  learnerImage?: string;
  rating: number; // 1-5
  title?: string;
  comment?: string;
  tags: string[];
  mentorResponse?: string;
  mentorResponseAt?: string;
  helpfulCount: number;
  isVerified: boolean;
  sessionTopic?: string;
  createdAt: string;
  updatedAt: string;
}

interface ReviewCardProps {
  review: Review;
  isMentorView?: boolean;
  onRespondToReview?: (reviewId: string, response: string) => void;
  onMarkHelpful?: (reviewId: string) => void;
  isResponding?: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  isMentorView = false,
  onRespondToReview,
  onMarkHelpful,
  isResponding = false
}) => {
  const [isShowingResponse, setIsShowingResponse] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [hasMarkedHelpful, setHasMarkedHelpful] = useState(false);

  const handleSubmitResponse = () => {
    if (responseText.trim() && onRespondToReview) {
      onRespondToReview(review.id, responseText);
      setResponseText('');
      setIsShowingResponse(false);
    }
  };

  const handleMarkHelpful = () => {
    if (!hasMarkedHelpful && onMarkHelpful) {
      onMarkHelpful(review.id);
      setHasMarkedHelpful(true);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600 bg-green-50';
    if (rating >= 3.5) return 'text-blue-600 bg-blue-50';
    if (rating >= 2.5) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        {/* Header with User Info and Rating */}
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={review.learnerImage} alt={review.learnerName} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {review.learnerName?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-semibold text-gray-900 truncate">
                  {review.learnerName}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center">
                    {renderStars(review.rating)}
                  </div>
                  <Badge className={`text-xs font-medium ${getRatingColor(review.rating)}`}>
                    {review.rating.toFixed(1)}
                  </Badge>
                  {review.isVerified && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      <span className="text-xs font-medium">Verified</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                </p>
                {review.sessionTopic && (
                  <p className="text-xs text-gray-400 mt-1">
                    Session: {review.sessionTopic}
                  </p>
                )}
              </div>
            </div>

            {/* Review Title */}
            {review.title && (
              <h5 className="font-medium text-gray-900 mb-2">
                {review.title}
              </h5>
            )}

            {/* Review Comment */}
            {review.comment && (
              <p className="text-gray-700 mb-3 leading-relaxed">
                {review.comment}
              </p>
            )}

            {/* Tags */}
            {review.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {review.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Helpful Button */}
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkHelpful}
                disabled={hasMarkedHelpful}
                className={`text-gray-500 hover:text-gray-700 gap-1 ${
                  hasMarkedHelpful ? 'text-green-600 hover:text-green-700' : ''
                }`}
              >
                <ThumbsUp className="h-4 w-4" />
                <span className="text-sm">
                  Helpful{hasMarkedHelpful ? ' ✓' : ''} ({review.helpfulCount + (hasMarkedHelpful ? 1 : 0)})
                </span>
              </Button>

              {/* Mentor Response Button */}
              {isMentorView && !review.mentorResponse && onRespondToReview && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsShowingResponse(!isShowingResponse)}
                  className="gap-1"
                >
                  <MessageSquare className="h-4 w-4" />
                  Respond
                </Button>
              )}
            </div>

            {/* Mentor Response Section */}
            {review.mentorResponse ? (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-gray-500" />
                  <p className="text-sm font-medium text-gray-700">Mentor Response</p>
                  {review.mentorResponseAt && (
                    <p className="text-xs text-gray-500 ml-auto">
                      {formatDistanceToNow(new Date(review.mentorResponseAt), { addSuffix: true })}
                    </p>
                  )}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {review.mentorResponse}
                </p>
              </div>
            ) : isMentorView && isShowingResponse && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                  <p className="text-sm font-medium text-blue-900">Write a Response</p>
                </div>
                <Textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Thank you for your feedback! Share your thoughts..."
                  className="mb-3 resize-none"
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSubmitResponse}
                    disabled={!responseText.trim() || isResponding}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isResponding ? 'Posting...' : 'Post Response'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsShowingResponse(false);
                      setResponseText('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewCard;
