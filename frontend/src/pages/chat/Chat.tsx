import { useMemo, useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useParams, Link } from 'react-router-dom';
import { useMessages, useSendMessage, useMentorByUserId } from '@/hooks/useApi';
import LearnerLayout from '@/components/LearnerLayout';
import MentorLayout from '@/components/MentorLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Send, User, Phone, Video, MoreVertical, Check, CheckCheck, Star, MapPin, Briefcase, Clock, Wifi, WifiOff } from 'lucide-react';

const Chat = () => {
  const { user } = useAuth();
  const { userId } = useParams<{ userId: string }>();
  
  // Debug logging
  console.log('Chat page - userId:', userId);
  console.log('Chat page - user role:', user?.role);
  
  const { data: messages = [], isLoading } = useMessages(userId!);
  const sendMessage = useSendMessage();
  const [message, setMessage] = useState('');
  const [showMentorDetails, setShowMentorDetails] = useState(false);
  const Layout = user?.role === 'MENTOR' ? MentorLayout : LearnerLayout;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch mentor/learner details
  const { data: mentorData, isLoading: mentorLoading, error: mentorError } = useMentorByUserId(userId!);
  
  console.log('Chat page - mentorData:', mentorData);
  console.log('Chat page - mentorLoading:', mentorLoading);
  console.log('Chat page - mentorError:', mentorError);

  const typedMessages = useMemo(() => messages as unknown as { 
  id: string; 
  content: string; 
  createdAt?: string; 
  senderId: string;
  status?: 'sent' | 'delivered' | 'read';
}[], [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [typedMessages]);

  // Get mentor/learner details
  const getPersonDetails = () => {
    if (mentorData) {
      const name = mentorData.user?.name || 'Unknown Mentor';
      const expertise = mentorData.skills?.map((s: any) => s.skill?.name).filter(Boolean) || [];
      const rating = mentorData.reviews?.length > 0 
        ? (mentorData.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / mentorData.reviews.length).toFixed(1)
        : '0.0';
      const hourlyRate = mentorData.hourlyRate || 0;
      const location = mentorData.location || 'Remote';
      const isVerified = mentorData.isVerified || false;
      const bio = mentorData.bio || mentorData.title || 'Professional Mentor';
      
      return {
        name,
        expertise,
        rating,
        hourlyRate,
        location,
        isVerified,
        bio,
        reviewCount: mentorData.reviews?.length || 0,
        title: mentorData.title || '',
        languages: mentorData.languages || []
      };
    }
    
    // Fallback for learners or when mentor data is not available
    return {
      name: 'Chat Partner',
      expertise: [],
      rating: '0.0',
      hourlyRate: 0,
      location: 'Remote',
      isVerified: false,
      bio: 'Ready to connect and learn',
      reviewCount: 0,
      title: '',
      languages: []
    };
  };

  const personDetails = getPersonDetails();

  // Handle loading and error states
  const isPageLoading = isLoading || mentorLoading;
  const hasError = mentorError || (!mentorData && !mentorLoading && userId);

  // Auto-refresh mentor data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (userId && !mentorLoading) {
        // This will trigger a refetch of mentor data
        // React Query will handle the caching and deduplication
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [userId, mentorLoading]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    sendMessage.mutate({ receiverId: userId!, content: message });
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-4rem)] bg-background">
        {/* Enhanced Chat Header with Mentor Details */}
        <div className="border-b bg-gradient-to-r from-card to-card/95 backdrop-blur-sm px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                to={user?.role === 'MENTOR' ? '/mentor/chat' : '/mentors'} 
                className="p-2.5 hover:bg-secondary/80 rounded-xl transition-all hover:scale-105"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-primary flex items-center justify-center border-2 border-primary/20">
                    {mentorLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                    ) : (
                      <User className="h-7 w-7" />
                    )}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
                  {personDetails.isVerified && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-background flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-bold text-lg">{personDetails.name}</h2>
                    {personDetails.isVerified && (
                      <div className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                        ✓ Verified
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    You are chatting with <span className="font-medium text-foreground">this mentor</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Active now</span>
                    </div>
                    {personDetails.rating !== '0.0' && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                        <span>{personDetails.rating}</span>
                      </div>
                    )}
                    {personDetails.hourlyRate > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="font-medium">₹{Number(personDetails.hourlyRate || 0).toLocaleString('en-IN')}/hr</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{personDetails.location}</span>
                    </div>
                    {personDetails.expertise.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        <span>{personDetails.expertise.slice(0, 2).join(', ')}</span>
                        {personDetails.expertise.length > 2 && <span>+{personDetails.expertise.length - 2}</span>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Connection Status Indicator */}
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-muted/30">
                {isPageLoading ? (
                  <div className="flex items-center gap-1">
                    <WifiOff className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Connecting...</span>
                  </div>
                ) : mentorData ? (
                  <div className="flex items-center gap-1">
                    <Wifi className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-600">Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <WifiOff className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Offline</span>
                  </div>
                )}
              </div>
              <Link
                to={mentorData ? `/mentor/${mentorData.id}` : '#'}
                className="px-3 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                View Mentor Profile
              </Link>
              <Button variant="ghost" size="sm" className="p-2 hover:bg-secondary/80 rounded-xl transition-all">
                <Phone className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2 hover:bg-secondary/80 rounded-xl transition-all">
                <Video className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2 hover:bg-secondary/80 rounded-xl transition-all">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Messages Area */}
        <div className="flex-1 overflow-auto bg-gradient-to-b from-background via-background to-muted/20">
          <div className="max-w-4xl mx-auto">
            {/* Date Separator */}
            <div className="flex items-center justify-center py-4">
              <div className="bg-muted/30 px-3 py-1 rounded-full">
                <p className="text-xs text-muted-foreground font-medium">Today</p>
              </div>
            </div>

            <div className="px-6 pb-6">
              {isPageLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary/70"></div>
                  <p className="text-sm text-muted-foreground">Loading messages...</p>
                </div>
              </div>
            ) : hasError ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6 border border-red-200">
                  <WifiOff className="h-10 w-10 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-red-600">Connection Error</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  Unable to load mentor details from the server. Please check your connection and try again.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.reload()}
                    className="px-6"
                  >
                    Refresh Page
                  </Button>
                  <Button 
                    onClick={() => setShowMentorDetails(false)}
                    className="px-6"
                  >
                    Continue Chat
                  </Button>
                </div>
              </div>
              ) : typedMessages.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-6 border border-primary/20">
                    <User className="h-10 w-10 text-primary/60" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Start the conversation</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Send a friendly message to begin connecting with your mentor/learner. 
                    This is a safe space for learning and growth.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                      👋 Say hello
                    </span>
                    <span className="px-3 py-1.5 bg-secondary/50 text-secondary-foreground rounded-full text-xs font-medium">
                      📚 Ask about availability
                    </span>
                    <span className="px-3 py-1.5 bg-secondary/50 text-secondary-foreground rounded-full text-xs font-medium">
                      🎯 Discuss learning goals
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {typedMessages.map((msg, index) => {
                    const isMine = msg.senderId === user?.id;
                    const showDateSeparator = index === 0 || 
                      new Date(msg.createdAt!).toDateString() !== new Date(typedMessages[index - 1]?.createdAt!).toDateString();
                    
                    return (
                      <div key={msg.id}>
                        {showDateSeparator && (
                          <div className="flex items-center justify-center py-4">
                            <div className="bg-muted/30 px-3 py-1 rounded-full">
                              <p className="text-xs text-muted-foreground font-medium">
                                {new Date(msg.createdAt!).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                              </p>
                            </div>
                          </div>
                        )}
                        <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} group`}>
                          <div className={`max-w-[75%] relative ${
                            isMine ? 'flex flex-col items-end' : 'flex flex-col items-start'
                          }`}>
                            <div className={`rounded-2xl px-5 py-3 shadow-sm transition-all hover:shadow-md ${
                              isMine 
                                ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground' 
                                : 'bg-gradient-to-br from-muted/80 to-muted border border-muted/50'
                            }`}>
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                              <div className={`flex items-center gap-2 mt-2 ${
                                isMine ? 'justify-end' : 'justify-start'
                              }`}>
                                {msg.createdAt && (
                                  <p className={`text-xs ${isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                )}
                                {isMine && (
                                  <div className="flex items-center gap-1">
                                    {msg.status === 'read' ? (
                                      <CheckCheck className="h-3.5 w-3.5 text-blue-400" />
                                    ) : msg.status === 'delivered' ? (
                                      <CheckCheck className="h-3.5 w-3.5 text-primary-foreground/50" />
                                    ) : (
                                      <Check className="h-3.5 w-3.5 text-primary-foreground/30" />
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            {!isMine && (
                              <p className="text-xs text-muted-foreground mt-1 ml-1">
                                {msg.senderId === user?.id ? 'You' : 'Them'}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Message Input */}
        <div className="border-t bg-gradient-to-t from-card to-card/95 backdrop-blur-sm p-4 shadow-lg">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  rows={1}
                  className="w-full px-4 py-3 pr-12 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all placeholder:text-muted-foreground/50"
                  disabled={sendMessage.isPending}
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                />
                <div className="absolute right-2 bottom-2 flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="p-1.5 h-8 w-8 hover:bg-secondary/60 rounded-lg transition-all">
                    <span className="text-lg">📎</span>
                  </Button>
                </div>
              </div>
              <Button 
                onClick={handleSendMessage} 
                disabled={!message.trim() || sendMessage.isPending}
                className="px-6 h-12 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendMessage.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="flex items-center justify-between mt-2 px-1">
              <p className="text-xs text-muted-foreground">
                Press Enter to send, Shift+Enter for new line
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">End-to-end encrypted</span>
                <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mentor Details Modal */}
      {showMentorDetails && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Mentor Profile</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMentorDetails(false)}
                  className="p-2 hover:bg-secondary rounded-lg"
                >
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </Button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-primary flex items-center justify-center border-2 border-primary/20">
                    {mentorLoading ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                    ) : (
                      <User className="h-10 w-10" />
                    )}
                  </div>
                  {personDetails.isVerified && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full border-2 border-background flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-lg font-bold">{personDetails.name}</h4>
                    {personDetails.isVerified && (
                      <div className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                        ✓ Verified
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    {personDetails.rating !== '0.0' && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{personDetails.rating}</span>
                        <span>({mentorData?.reviews?.length || 0} reviews)</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-muted-foreground">Active now</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h5 className="font-semibold mb-2">About</h5>
                  <p className="text-sm text-muted-foreground">{personDetails.bio}</p>
                </div>

                {personDetails.expertise.length > 0 && (
                  <div>
                    <h5 className="font-semibold mb-2">Expertise</h5>
                    <div className="flex flex-wrap gap-2">
                      {personDetails.expertise.map((skill, index) => (
                        <span key={index} className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-semibold mb-2">Hourly Rate</h5>
                    <p className="text-2xl font-bold text-primary">
                      ₹{Number(personDetails.hourlyRate || 0).toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-muted-foreground">per hour</p>
                  </div>
                  <div>
                    <h5 className="font-semibold mb-2">Location</h5>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{personDetails.location}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Usually responds within 1 hour
                  </span>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Link
                  to={mentorData ? `/mentor/${mentorData.id}` : '#'}
                  className="flex-1"
                  onClick={() => setShowMentorDetails(false)}
                >
                  <Button variant="outline" className="w-full">
                    View Full Profile
                  </Button>
                </Link>
                <Button className="flex-1">
                  Book Session
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Chat;