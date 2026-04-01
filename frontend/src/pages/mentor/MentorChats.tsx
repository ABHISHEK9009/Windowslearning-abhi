import { useEffect, useMemo, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import MentorLayout from '@/components/MentorLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useChatConversations, useMessages, useSendMessage } from '@/hooks/useApi';
import { ArrowLeft, Send, User, MessageCircle, Clock, Search, Filter, Phone, Video, MoreVertical, Check, CheckCheck } from 'lucide-react';

type Conversation = {
  otherUserId: string;
  otherName: string;
  lastMessage: string | null;
  lastMessageAt: string | Date;
  otherProfilePicture?: string | null;
};

type ChatMessage = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string | Date;
};

const MentorChats = () => {
  const { user } = useAuth();
  const { data: conversations = [], isLoading: conversationsLoading } = useChatConversations();
  const [activeOtherUserId, setActiveOtherUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { data: messages = [], isLoading: messagesLoading } = useMessages(activeOtherUserId || '');
  const sendMessage = useSendMessage();

  const [draft, setDraft] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const typedConversations = conversations as unknown as Conversation[];
  const typedMessages = useMemo(() => messages as unknown as ChatMessage[], [messages]);

  const filteredConversations = useMemo(() => {
    if (!searchQuery) return typedConversations;
    return typedConversations.filter(c => 
      c.otherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.lastMessage && c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [typedConversations, searchQuery]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!activeOtherUserId && filteredConversations.length > 0) {
      setActiveOtherUserId(filteredConversations[0].otherUserId);
    }
  }, [activeOtherUserId, filteredConversations]);

  useEffect(() => {
    scrollToBottom();
  }, [typedMessages]);

  const currentUserId = user?.id;
  const activeConversation = filteredConversations.find(c => c.otherUserId === activeOtherUserId);

  const handleSend = () => {
    if (!activeOtherUserId) return;
    if (!draft.trim()) return;
    sendMessage.mutate({ receiverId: activeOtherUserId, content: draft });
    setDraft('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: string | Date) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getUnreadCount = (conversation: Conversation) => {
    // This would come from API, for now return 0
    return 0;
  };

  return (
    <MentorLayout>
      <div className="flex flex-col h-[calc(100vh-4rem)] bg-background">
        {/* Enhanced Header */}
        <div className="border-b bg-gradient-to-r from-card to-card/95 backdrop-blur-sm px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <MessageCircle className="h-7 w-7 text-primary" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-background"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold">Messages</h1>
                <p className="text-sm text-muted-foreground">Connect with your learners</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/mentor/requests"
                className="text-sm text-primary hover:underline flex items-center gap-1 px-3 py-1.5 bg-primary/10 rounded-lg hover:bg-primary/20 transition-all"
              >
                View Requests
              </Link>
              <Button variant="ghost" size="sm" className="p-2 hover:bg-secondary/80 rounded-xl transition-all">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Enhanced Conversations List */}
          <div className="w-96 border-r bg-gradient-to-b from-card to-muted/20 flex flex-col">
            {/* Search Bar */}
            <div className="p-4 border-b bg-card/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-background border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 hover:bg-secondary/60 rounded-lg"
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
              {showFilters && (
                <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">Filter options coming soon...</p>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-auto">
              {conversationsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary/70"></div>
                    <p className="text-sm text-muted-foreground">Loading conversations...</p>
                  </div>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-20 px-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-4 border border-primary/20">
                    <MessageCircle className="h-8 w-8 text-primary/60" />
                  </div>
                  <h3 className="font-semibold mb-2">
                    {searchQuery ? 'No conversations found' : 'No conversations yet'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? 'Try adjusting your search terms' : 'Start chatting with learners!'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {filteredConversations.map((c) => {
                    const active = c.otherUserId === activeOtherUserId;
                    const unreadCount = getUnreadCount(c);
                    return (
                      <button
                        key={c.otherUserId}
                        onClick={() => setActiveOtherUserId(c.otherUserId)}
                        className={`w-full text-left p-4 transition-all hover:bg-secondary/30 ${
                          active ? 'bg-gradient-to-r from-primary/5 to-transparent border-l-4 border-primary' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-primary flex items-center justify-center flex-shrink-0 border-2 border-primary/20">
                              <User className="h-6 w-6" />
                            </div>
                            {unreadCount > 0 && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                                {unreadCount}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <p className="font-semibold truncate">{c.otherName}</p>
                              {c.lastMessageAt && (
                                <span className="text-xs text-muted-foreground flex-shrink-0">
                                  {formatTime(c.lastMessageAt)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm text-muted-foreground truncate">
                                {c.lastMessage || 'No messages yet'}
                              </p>
                              {c.lastMessageAt && new Date(c.lastMessageAt).getTime() > Date.now() - 24 * 60 * 60 * 1000 && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Chat Area */}
          <div className="flex-1 flex flex-col bg-gradient-to-b from-background via-background to-muted/10">
            {!activeOtherUserId ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-md">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-6 border border-primary/20">
                    <MessageCircle className="h-12 w-12 text-primary/60" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Welcome to Messages</h3>
                  <p className="text-muted-foreground mb-6">
                    Select a conversation from the list to start chatting with your learners. 
                    Build meaningful connections and guide them on their learning journey.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                      📚 Active learners
                    </span>
                    <span className="px-3 py-1.5 bg-secondary/50 text-secondary-foreground rounded-full text-xs font-medium">
                      💬 Real-time chat
                    </span>
                    <span className="px-3 py-1.5 bg-secondary/50 text-secondary-foreground rounded-full text-xs font-medium">
                      🔔 Instant notifications
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Enhanced Chat Header */}
                <div className="border-b bg-gradient-to-r from-card to-card/95 backdrop-blur-sm px-6 py-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-primary flex items-center justify-center border-2 border-primary/20">
                          <User className="h-6 w-6" />
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{activeConversation?.otherName || 'Unknown'}</h3>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <p className="text-sm text-muted-foreground">Active now • Ready to learn</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
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

                {/* Enhanced Messages */}
                <div className="flex-1 overflow-auto">
                  <div className="max-w-4xl mx-auto">
                    {/* Date Separator */}
                    <div className="flex items-center justify-center py-4">
                      <div className="bg-muted/30 px-3 py-1 rounded-full">
                        <p className="text-xs text-muted-foreground font-medium">Today</p>
                      </div>
                    </div>

                    <div className="px-6 pb-6">
                      {messagesLoading ? (
                        <div className="flex items-center justify-center py-20">
                          <div className="flex flex-col items-center gap-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary/70"></div>
                            <p className="text-sm text-muted-foreground">Loading messages...</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {typedMessages.map((m, index) => {
                            const mine = m.senderId === currentUserId;
                            const showDateSeparator = index === 0 || 
                              new Date(m.createdAt).toDateString() !== new Date(typedMessages[index - 1]?.createdAt).toDateString();
                            
                            return (
                              <div key={m.id}>
                                {showDateSeparator && (
                                  <div className="flex items-center justify-center py-4">
                                    <div className="bg-muted/30 px-3 py-1 rounded-full">
                                      <p className="text-xs text-muted-foreground font-medium">
                                        {new Date(m.createdAt).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                                      </p>
                                    </div>
                                  </div>
                                )}
                                <div className={`flex ${mine ? 'justify-end' : 'justify-start'} group`}>
                                  <div className={`max-w-[75%] ${
                                    mine ? 'flex flex-col items-end' : 'flex flex-col items-start'
                                  }`}>
                                    <div className={`rounded-2xl px-5 py-3 shadow-sm transition-all hover:shadow-md ${
                                      mine 
                                        ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground' 
                                        : 'bg-gradient-to-br from-muted/80 to-muted border border-muted/50'
                                    }`}>
                                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                                      <div className={`flex items-center gap-2 mt-2 ${
                                        mine ? 'justify-end' : 'justify-start'
                                      }`}>
                                        <p className={`text-xs ${mine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        {mine && (
                                          <div className="flex items-center gap-1">
                                            <CheckCheck className="h-3.5 w-3.5 text-blue-400" />
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          {typedMessages.length === 0 && (
                            <div className="text-center py-10">
                              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-4 border border-primary/20">
                                <MessageCircle className="h-8 w-8 text-primary/60" />
                              </div>
                              <p className="text-muted-foreground">No messages in this conversation yet.</p>
                              <p className="text-sm text-muted-foreground mt-1">Be the first to say hello!</p>
                            </div>
                          )}
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
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
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
                        onClick={handleSend}
                        disabled={!draft.trim() || sendMessage.isPending}
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
              </>
            )}
          </div>
        </div>
      </div>
    </MentorLayout>
  );
};

export default MentorChats;

