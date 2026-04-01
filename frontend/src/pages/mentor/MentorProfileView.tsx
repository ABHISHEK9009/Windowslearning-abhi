import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  User, 
  Briefcase, 
  DollarSign, 
  Clock, 
  Globe, 
  Award, 
  Star, 
  Calendar,
  MapPin,
  Languages,
  GraduationCap,
  CheckCircle,
  MessageSquare,
  ThumbsUp,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReviewCard from '@/components/ReviewCard';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface MentorProfile {
  id: string;
  fullName: string;
  profileImage?: string;
  headline?: string;
  bio?: string;
  location?: string;
  languages: string[];
  skillsData: Record<string, string>;
  experienceYears: number;
  currentCompany?: string;
  currentRole?: string;
  pastExperience: Array<{
    company: string;
    role: string;
    years: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: number;
  }>;
  hourlyRate?: number;
  currency: string;
  packageDeals: Array<{
    sessions: number;
    price: number;
    savings: number;
  }>;
  freeConsultation: boolean;
  weeklySchedule: Record<string, string[]>;
  timeZone: string;
  responseTime?: string;
  timeOff: Array<{
    start: string;
    end: string;
    reason: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    year: number;
    fileUrl?: string;
  }>;
  verificationStatus: string;
  totalSessions: number;
  totalStudents: number;
  averageRating?: number;
  totalReviews: number;
  responseRate?: number;
  completionRate?: number;
  user: {
    id: any;
    name: string;
    email: string;
    profileImage?: string;
  };
  reviews: Array<{
    id: string;
    learnerName: string;
    learnerImage?: string;
    rating: number;
    title?: string;
    comment?: string;
    tags: string[];
    mentorResponse?: string;
    mentorResponseAt?: string;
    helpfulCount: number;
    isVerified: boolean;
    sessionTopic?: string;
    createdAt: string;
  }>;
}

const MentorProfileView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<MentorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  useEffect(() => {
    fetchMentorProfile();
  }, [id]);

  const fetchMentorProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/mentor-profiles/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch mentor profile');
      }
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching mentor profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load mentor profile',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookSession = () => {
    // Navigate to booking page
    window.location.href = `/mentor/${id}/book`;
  };

  const handleSendMessage = () => {
    // Navigate to chat page
    window.location.href = `/chat/${profile?.user.id}`;
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

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'expert': return 'bg-green-100 text-green-800';
      case 'advanced': return 'bg-blue-100 text-blue-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'beginner': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading mentor profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Mentor Not Found</h2>
          <p className="text-gray-600">The mentor profile you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.profileImage || profile.user.profileImage} alt={profile.fullName} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary font-semibold">
                  {profile.fullName?.charAt(0)?.toUpperCase() || 'M'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profile.fullName}</h1>
                <p className="text-gray-600">{profile.headline}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    {renderStars(Math.round(profile.averageRating || 0))}
                    <span className="text-sm text-gray-600 ml-1">
                      {profile.averageRating?.toFixed(1)} ({profile.totalReviews} reviews)
                    </span>
                  </div>
                  {profile.verificationStatus === 'approved' && (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleSendMessage}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Button>
              <Button onClick={handleBookSession}>
                <Calendar className="h-4 w-4 mr-2" />
                Book Session
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="experience">Experience</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Bio */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      About
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                  </CardContent>
                </Card>

                {/* Skills */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Skills & Expertise
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(profile.skillsData || {}).map(([skill, level]) => (
                        <div key={skill} className="flex items-center justify-between">
                          <span className="font-medium">{skill}</span>
                          <Badge className={getSkillLevelColor(level)}>
                            {level}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Availability */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Availability
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{profile.timeZone}</span>
                    </div>
                    {profile.responseTime && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Response time: {profile.responseTime}</span>
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium mb-2">Weekly Schedule</h4>
                      <div className="space-y-1">
                        {Object.entries(profile.weeklySchedule || {}).map(([day, times]) => (
                          <div key={day} className="flex items-center gap-2">
                            <span className="text-sm font-medium capitalize w-20">{day}:</span>
                            <span className="text-sm text-gray-600">
                              {times.length > 0 ? times.join(', ') : 'Not available'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="experience" className="space-y-6">
                {/* Current Position */}
                {(profile.currentCompany || profile.currentRole) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        Current Position
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <h4 className="font-medium">{profile.currentRole}</h4>
                        <p className="text-gray-600">{profile.currentCompany}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Past Experience */}
                {profile.pastExperience && profile.pastExperience.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        Past Experience
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {profile.pastExperience.map((exp, index) => (
                          <div key={index} className="border-l-2 border-gray-200 pl-4">
                            <h4 className="font-medium">{exp.role}</h4>
                            <p className="text-gray-600">{exp.company}</p>
                            <p className="text-sm text-gray-500">{exp.years}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Education */}
                {profile.education && profile.education.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        Education
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {profile.education.map((edu, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <GraduationCap className="h-5 w-5 text-gray-400 mt-1" />
                            <div>
                              <h4 className="font-medium">{edu.degree}</h4>
                              <p className="text-gray-600">{edu.institution}</p>
                              <p className="text-sm text-gray-500">{edu.year}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Certifications */}
                {profile.certifications && profile.certifications.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Certifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {profile.certifications.map((cert, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <h4 className="font-medium">{cert.name}</h4>
                              <p className="text-sm text-gray-600">{cert.issuer} • {cert.year}</p>
                            </div>
                            {cert.fileUrl && (
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="pricing" className="space-y-6">
                {/* Hourly Rate */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Hourly Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">
                      {profile.currency} {profile.hourlyRate}
                      <span className="text-lg font-normal text-gray-600">/hour</span>
                    </div>
                    {profile.freeConsultation && (
                      <Badge className="mt-2 bg-green-100 text-green-800">
                        Free consultation available
                      </Badge>
                    )}
                  </CardContent>
                </Card>

                {/* Package Deals */}
                {profile.packageDeals && profile.packageDeals.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Package Deals</CardTitle>
                      <CardDescription>Save money with bulk sessions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {profile.packageDeals.map((pkg, index) => (
                          <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h4 className="font-medium">{pkg.sessions} Sessions</h4>
                              <p className="text-sm text-gray-600">
                                {profile.currency} {pkg.price} total
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-600">
                                Save {profile.currency} {pkg.savings}
                              </p>
                              <p className="text-sm text-gray-600">
                                {profile.currency} {Math.round(pkg.price / pkg.sessions)}/session
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                {/* Rating Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Reviews & Ratings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-primary">
                          {profile.averageRating?.toFixed(1) || '0.0'}
                        </div>
                        <div className="flex items-center justify-center gap-1 my-2">
                          {renderStars(Math.round(profile.averageRating || 0))}
                        </div>
                        <p className="text-sm text-gray-600">
                          {profile.totalReviews} reviews
                        </p>
                      </div>
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map(rating => {
                          const percentage = 0; // This would come from rating distribution
                          return (
                            <div key={rating} className="flex items-center gap-2">
                              <span className="text-sm w-3">{rating}</span>
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-yellow-400 h-2 rounded-full" 
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-600 w-10">
                                {percentage}%
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Reviews List */}
                <div className="space-y-4">
                  {profile.reviews.map(review => (
                    <ReviewCard
                      key={review.id}
                      review={{
                        ...review,
                        sessionId: review.sessionId || '',
                        mentorId: review.mentorId || profile.id,
                        learnerId: review.learnerId || '',
                        updatedAt: review.updatedAt || review.createdAt
                      }}
                      onMarkHelpful={(reviewId) => {
                        // Handle marking review as helpful
                        console.log('Mark review as helpful:', reviewId);
                      }}
                    />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Sessions</span>
                  <span className="font-semibold">{profile.totalSessions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Students</span>
                  <span className="font-semibold">{profile.totalStudents}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Response Rate</span>
                  <span className="font-semibold">{profile.responseRate || 0}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completion Rate</span>
                  <span className="font-semibold">{profile.completionRate || 0}%</span>
                </div>
              </CardContent>
            </Card>

            {/* Location & Languages */}
            <Card>
              <CardHeader>
                <CardTitle>Location & Languages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{profile.location}</span>
                  </div>
                )}
                {profile.languages && profile.languages.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Languages className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Languages</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {profile.languages.map((language, index) => (
                        <Badge key={index} variant="secondary">
                          {language}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Get Started</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={handleBookSession} className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  Book a Session
                </Button>
                <Button variant="outline" onClick={handleSendMessage} className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorProfileView;
