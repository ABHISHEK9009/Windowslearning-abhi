import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { useSocketSync } from "./hooks/useSocketSync";
import { useSessionSecurity } from "./hooks/useSessionSecurity";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";

// Public pages
import Index from "./pages/public/Index";
import About from "./pages/public/About";
import Contact from "./pages/public/Contact";
import Blog from "./pages/public/Blog";
import Careers from "./pages/public/Careers";
import Press from "./pages/public/Press";
import FAQ from "./pages/public/FAQ";
import HowItWorksPage from "./pages/public/HowItWorks";
import Pricing from "./pages/public/Pricing";

// Legal pages
import Terms from "./pages/legal/Terms";
import Privacy from "./pages/legal/Privacy";
import Safety from "./pages/legal/Safety";

// Auth pages
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import EmailVerification from "./pages/auth/EmailVerification";

// Onboarding pages
import LearnerOnboarding from "./pages/onboarding/LearnerOnboarding";
import MentorOnboarding from "./pages/onboarding/MentorOnboarding";

// Learner pages
import LearnerDashboard from "./pages/learner/LearnerDashboard";
import LearnerSessions from "./pages/learner/LearnerSessions";
import LearnerProgress from "./pages/learner/LearnerProgress";
import LearnerWallet from "./pages/learner/LearnerWallet";
import PostRequirement from "./pages/learner/PostRequirement";

// Mentor pages
import MentorDashboard from "./pages/mentor/MentorDashboard";
import MentorRequests from "./pages/mentor/MentorRequests";
import MentorProposals from "./pages/mentor/MentorProposals";
import MentorSessions from "./pages/mentor/MentorSessions";
import MentorEarnings from "./pages/mentor/MentorEarnings";
import MentorAvailability from "./pages/mentor/MentorAvailability";
import MentorProfileEdit from "./pages/mentor/MentorProfileEdit";
import MentorProfileView from "./pages/mentor/MentorProfileView";
import MentorRequestDetail from "./pages/mentor/MentorRequestDetail";
import MentorChats from "./pages/mentor/MentorChats";
import MentorVerificationPending from "./pages/mentor/MentorVerificationPending";

// Chat pages
import Chat from "./pages/chat/Chat";

// Discovery pages
import BrowseMentors from "./pages/discovery/BrowseMentors";

// Support pages
import HelpCenter from "./pages/support/HelpCenter";
import SupportTicket from "./pages/support/SupportTicket";

// Settings pages
import SettingsPage from "./pages/settings/Settings";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLayout from "./components/AdminLayout";

// Common pages
import NotFound from "./pages/common/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000), // exponential backoff
      staleTime: 1000 * 60 * 2,   // data stays fresh for 2 min
      gcTime: 1000 * 60 * 10,     // keep in cache for 10 min
      refetchOnWindowFocus: true,  // refresh stale data when user comes back to tab
    },
  },
});

const SocketSyncWrapper = ({ children }: { children: React.ReactNode }) => {
  useSocketSync();
  useSessionSecurity();
  return <>{children}</>;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketSyncWrapper>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/press" element={<Press />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/pricing" element={<Pricing />} />

                {/* Legal Routes */}
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/safety" element={<Safety />} />

                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/register" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify-email" element={<EmailVerification />} />

                {/* Onboarding Routes */}
                <Route path="/onboarding/learner" element={<ProtectedRoute allowedRoles={['LEARNER']}><LearnerOnboarding /></ProtectedRoute>} />
                <Route path="/onboarding/mentor" element={<ProtectedRoute allowedRoles={['MENTOR']}><MentorOnboarding /></ProtectedRoute>} />
                <Route path="/mentor/verification-pending" element={<ProtectedRoute allowedRoles={['MENTOR']}><MentorVerificationPending /></ProtectedRoute>} />

                {/* Learner Routes */}
                <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['LEARNER']}><LearnerDashboard /></ProtectedRoute>} />
                <Route path="/learner/dashboard" element={<ProtectedRoute allowedRoles={['LEARNER']}><LearnerDashboard /></ProtectedRoute>} />
                <Route path="/learner/sessions" element={<ProtectedRoute allowedRoles={['LEARNER']}><LearnerSessions /></ProtectedRoute>} />
                <Route path="/learner/progress" element={<ProtectedRoute allowedRoles={['LEARNER']}><LearnerProgress /></ProtectedRoute>} />
                <Route path="/learner/wallet" element={<ProtectedRoute allowedRoles={['LEARNER']}><LearnerWallet /></ProtectedRoute>} />
                <Route path="/learner/requirements/post" element={<ProtectedRoute allowedRoles={['LEARNER']}><PostRequirement /></ProtectedRoute>} />

                {/* Mentor Routes */}
                <Route path="/mentor/dashboard" element={<ProtectedRoute allowedRoles={['MENTOR']}><MentorDashboard /></ProtectedRoute>} />
                <Route path="/mentor/requests" element={<ProtectedRoute allowedRoles={['MENTOR']}><MentorRequests /></ProtectedRoute>} />
                <Route path="/mentor/requests/:id" element={<ProtectedRoute allowedRoles={['MENTOR']}><MentorRequestDetail /></ProtectedRoute>} />
                <Route path="/mentor/proposals" element={<ProtectedRoute allowedRoles={['MENTOR']}><MentorProposals /></ProtectedRoute>} />
                <Route path="/mentor/sessions" element={<ProtectedRoute allowedRoles={['MENTOR']}><MentorSessions /></ProtectedRoute>} />
                <Route path="/mentor/earnings" element={<ProtectedRoute allowedRoles={['MENTOR']}><MentorEarnings /></ProtectedRoute>} />
                <Route path="/mentor/availability" element={<ProtectedRoute allowedRoles={['MENTOR']}><MentorAvailability /></ProtectedRoute>} />
                <Route path="/mentor/profile/edit" element={<ProtectedRoute allowedRoles={['MENTOR']}><MentorProfileEdit /></ProtectedRoute>} />
                <Route path="/mentor/chat" element={<ProtectedRoute allowedRoles={['MENTOR']}><MentorChats /></ProtectedRoute>} />

                {/* Shared Routes (Both Mentor and Learner) */}
                <Route path="/mentors" element={<BrowseMentors />} />
                <Route path="/mentor/:id" element={<MentorProfileView />} />
                <Route path="/chat/:userId" element={<ProtectedRoute allowedRoles={['MENTOR', 'LEARNER']}><Chat /></ProtectedRoute>} />

                {/* Support & Settings Routes */}
                <Route path="/help" element={<HelpCenter />} />
                <Route path="/support/ticket" element={<ProtectedRoute><SupportTicket /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
                <Route path="/admin/verify-mentors" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminLayout><AdminDashboard initialTab="pending" /></AdminLayout></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminLayout><AdminDashboard initialTab="all" /></AdminLayout></ProtectedRoute>} />

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </SocketSyncWrapper>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
