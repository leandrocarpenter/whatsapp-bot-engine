export interface Key {
  id: string;
  fromMe: boolean;
  remoteJid: string;
  participant?: string;
}

export interface MessageData {
  key: Key;
  pushName?: string;
  messageType: string;
  message?: {
    conversation?: string;
    extendedTextMessage?: {
      text?: string;
    };
  };
  messageTimestamp?: string;
  instanceId?: string;
  source?: string;
}

export interface WebhookMessagePayload {
  event: string;
  instance: string;
  data: MessageData;
  destination?: string;
  date_time?: string;
}

export interface SendTextPayload {
  number: string;
  text: string;
  options?: {
    delay?: number;
    presence?: 'composing' | 'recording' | 'paused';
    linkPreview?: boolean;
  };
}