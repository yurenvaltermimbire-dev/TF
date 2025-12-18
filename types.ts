
export type AssistantState = 'IDLE' | 'LISTENING' | 'SPOKEN_RESPONSE' | 'EXECUTING';

export interface AppInfo {
  id: string;
  name: string;
  icon: string;
  url: string;
  category: 'comm' | 'media' | 'tools' | 'system';
}

export interface SystemSettings {
  wifi: boolean;
  bluetooth: boolean;
  brightness: number;
  volume: number;
  isLocked: boolean;
}

export interface Notification {
  id: string;
  app: string;
  content: string;
  time: string;
}
