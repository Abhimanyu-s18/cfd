/**
 * notifications.ts - Hooks for sending notifications
 * 
 * Engine produces notification effects.
 * System delivers based on user preferences.
 */

export interface NotificationSink {
  notifyMarginCall(accountId: string, marginLevel: number): Promise<void>;
  notifyLiquidation(accountId: string, marginLevel: number, closedCount: number): Promise<void>;
  notifyPositionClosed(accountId: string, positionId: string, reason: string): Promise<void>;
}

// TODO: Create no-op implementation for testing
// TODO: Create email/SMS implementation for production
