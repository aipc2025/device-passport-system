/**
 * Error Tracking Service
 *
 * This module provides a unified interface for error tracking.
 * In production, configure with your preferred error tracking provider (e.g., Sentry, LogRocket, etc.)
 *
 * Configuration:
 * Set VITE_ERROR_TRACKING_DSN in your .env file to enable error tracking
 */

interface ErrorContext {
  componentStack?: string;
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  user?: {
    id?: string;
    email?: string;
    role?: string;
  };
}

interface ErrorTracker {
  captureException: (error: Error, context?: ErrorContext) => void;
  captureMessage: (message: string, level?: 'info' | 'warning' | 'error') => void;
  setUser: (user: { id?: string; email?: string; role?: string } | null) => void;
}

// Default implementation - logs to console
const consoleTracker: ErrorTracker = {
  captureException: (error: Error, context?: ErrorContext) => {
    console.error('[ErrorTracking] Exception captured:', {
      error: error.message,
      stack: error.stack,
      ...context,
    });
  },
  captureMessage: (message: string, level = 'info') => {
    const logFn = level === 'error' ? console.error : level === 'warning' ? console.warn : console.info;
    logFn(`[ErrorTracking] ${level.toUpperCase()}: ${message}`);
  },
  setUser: (user) => {
    if (user) {
      console.debug('[ErrorTracking] User set:', user);
    } else {
      console.debug('[ErrorTracking] User cleared');
    }
  },
};

// Production tracker - can be replaced with Sentry or other service
const productionTracker: ErrorTracker = {
  captureException: (error: Error, context?: ErrorContext) => {
    // In production, this would send to an error tracking service
    // Example Sentry integration:
    // if (typeof Sentry !== 'undefined') {
    //   Sentry.withScope((scope) => {
    //     if (context?.componentStack) {
    //       scope.setExtra('componentStack', context.componentStack);
    //     }
    //     if (context?.tags) {
    //       Object.entries(context.tags).forEach(([key, value]) => {
    //         scope.setTag(key, value);
    //       });
    //     }
    //     if (context?.extra) {
    //       Object.entries(context.extra).forEach(([key, value]) => {
    //         scope.setExtra(key, value);
    //       });
    //     }
    //     Sentry.captureException(error);
    //   });
    // }

    // For now, send to backend error logging endpoint
    const errorPayload = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...context,
    };

    // Fire and forget - don't block on this
    fetch('/api/v1/errors/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorPayload),
    }).catch(() => {
      // Silently fail - we don't want error logging to cause more errors
      console.error('[ErrorTracking] Failed to send error to backend');
    });

    // Also log to console for debugging
    console.error('[ErrorTracking] Production error captured:', errorPayload);
  },
  captureMessage: (message: string, level = 'info') => {
    // In production, this could send to a logging service
    const logFn = level === 'error' ? console.error : level === 'warning' ? console.warn : console.info;
    logFn(`[ErrorTracking] ${level.toUpperCase()}: ${message}`);
  },
  setUser: (user) => {
    // In production with Sentry:
    // Sentry.setUser(user);
    if (user) {
      console.debug('[ErrorTracking] User context set');
    }
  },
};

// Use production tracker in production, console tracker in development
const isProduction = import.meta.env.PROD;
const errorTracker: ErrorTracker = isProduction ? productionTracker : consoleTracker;

/**
 * Capture an exception and send to error tracking service
 */
export function captureException(error: Error, context?: ErrorContext): void {
  errorTracker.captureException(error, context);
}

/**
 * Capture a message/log and send to error tracking service
 */
export function captureMessage(message: string, level?: 'info' | 'warning' | 'error'): void {
  errorTracker.captureMessage(message, level);
}

/**
 * Set the current user context for error tracking
 */
export function setErrorTrackingUser(user: { id?: string; email?: string; role?: string } | null): void {
  errorTracker.setUser(user);
}

export default {
  captureException,
  captureMessage,
  setUser: setErrorTrackingUser,
};
