export type ContactMethod = 'whatsapp' | 'telegram';

export interface ContactLink {
  url: string;
  message: string;
  method: ContactMethod;
}

export interface ContactMethods {
  whatsappEnabled: boolean;
  telegramEnabled: boolean;
  whatsappLink?: string;
  telegramLink?: string;
  maskedPhone?: string;
}

export interface ContactInfo {
  phoneNumber?: string;
  telegramUsername?: string;
  whatsappEnabled?: boolean;
  telegramEnabled?: boolean;
}
