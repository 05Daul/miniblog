export type MessageType = "TALK" | "IMAGE" | "ENTER" | "LEAVE"|"READ";

export interface ChatMessage {
  chatId: string;
  type: MessageType;
  userSignId: string;
  name: string;
  roomId: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  readBy: string[];  // ⭐ 읽은 사용자 목록
  deleted: boolean;
}

export interface ChatRoom {
  roomId: string;
  roomName: string;
  participantIds: string[];
  creatorId: string;
  createdAt: string;
  lastMessageContent?: string;
  lastMessageTime?: string;
  lastMessageSenderId?: string;
  isOneToOne: boolean;
  unreadCount?: number;  // ⭐ 안읽은 메시지 개수
}

export interface ChatMessageDto {
  userSignId: string;
  name: string;
  roomId: string;
  content: string;
  type: MessageType;
  imageUrl?: string;
}