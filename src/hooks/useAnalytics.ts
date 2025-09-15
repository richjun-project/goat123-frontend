import { logEvent } from 'firebase/analytics';
import { analytics } from '../config/firebase';

export const useAnalytics = () => {
  const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
    if (analytics) {
      logEvent(analytics, eventName, parameters);
    }
  };

  const trackPageView = (pageName: string) => {
    trackEvent('page_view', {
      page_title: pageName,
      page_location: window.location.href,
      page_path: window.location.pathname,
    });
  };

  const trackVote = (pollId: string, pollTitle: string, optionText: string) => {
    trackEvent('vote', {
      poll_id: pollId,
      poll_title: pollTitle,
      option_text: optionText,
    });
  };

  const trackShare = (pollId: string, pollTitle: string, method: string) => {
    trackEvent('share', {
      poll_id: pollId,
      poll_title: pollTitle,
      method: method,
      content_type: 'poll',
    });
  };

  const trackPollCreate = (pollTitle: string, category: string) => {
    trackEvent('poll_create', {
      poll_title: pollTitle,
      category: category,
    });
  };

  const trackComment = (pollId: string, pollTitle: string) => {
    trackEvent('comment', {
      poll_id: pollId,
      poll_title: pollTitle,
    });
  };

  return {
    trackEvent,
    trackPageView,
    trackVote,
    trackShare,
    trackPollCreate,
    trackComment,
  };
};