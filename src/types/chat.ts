export interface FamilyMember {
  id: string;
  name: string;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
  type: 'text' | 'image';
  imageUrl?: string;
}

export interface Chat {
  id: string;
  type: 'individual' | 'group';
  participants: Array<{
    id: string;
    name: string;
  }>;
  name?: string;
  lastMessage?: {
    content: string;
    timestamp: Date;
  };
}