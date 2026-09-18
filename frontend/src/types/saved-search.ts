export interface SavedSearch {
  id: number;
  userId: number;
  name: string;
  query: Record<string, any>;
  filters: Record<string, any>;
  emailAlert: boolean;
  frequency: 'daily' | 'weekly' | 'never';
  createdAt: string;
  updatedAt: string;
  lastAlertSent?: string;
}

export type EmailFrequency = 'daily' | 'weekly' | 'never';
