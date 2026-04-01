import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_BEFORE_LOGOUT = 60 * 1000;   // warn 1 minute before

/**
 * useSessionSecurity
 *
 * Auto-logs out an idle user after 30 minutes of inactivity.
 * Shows a toast warning 1 minute before logout.
 * Timer resets on any mouse / keyboard / touch activity.
 */
export const useSessionSecurity = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const warnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user) return; // only protect authenticated sessions

    const clearTimers = () => {
      if (warnTimerRef.current) clearTimeout(warnTimerRef.current);
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    };

    const resetTimer = () => {
      clearTimers();

      warnTimerRef.current = setTimeout(() => {
        toast({
          title: '⚠️ Session Expiring Soon',
          description:
            'You will be automatically logged out in 1 minute due to inactivity. Move the mouse or press any key to stay signed in.',
          variant: 'destructive',
          duration: WARNING_BEFORE_LOGOUT,
        });
      }, INACTIVITY_TIMEOUT - WARNING_BEFORE_LOGOUT);

      logoutTimerRef.current = setTimeout(() => {
        toast({
          title: 'Logged Out',
          description: 'You were logged out due to inactivity.',
        });
        logout();
      }, INACTIVITY_TIMEOUT);
    };

    // Activity events that reset the inactivity clock
    const events: (keyof WindowEventMap)[] = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'scroll',
      'click',
    ];

    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer(); // start the timer on mount

    return () => {
      clearTimers();
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [user, logout, toast]);
};
