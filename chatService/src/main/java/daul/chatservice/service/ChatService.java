package daul.chatservice.service;

import daul.chatservice.dto.ChatMessageDto;
import daul.chatservice.entity.ChatMessage;
import daul.chatservice.entity.ChatRoom;
import java.util.List;

public interface ChatService {
  // 1. 채팅방 관리
  ChatRoom createChatRoom(String creatorId, List<String> participantIds, String roomName);
  List<ChatRoom> getUserChatRooms(String userId);

  // 2. 메시지 전송 및 Kafka 발행
  void sendMessageToKafka(ChatMessageDto messageDto);

  // 3. 메시지 히스토리 조회
  List<ChatMessage> getChatHistory(String roomId, int page, int size);

  // 4. 메시지 읽음 처리
  void markMessageAsRead(String roomId, String userId);

  // ⭐ 5. 안읽은 메시지 개수 조회
  long getUnreadMessageCount(String roomId, String userId);

  // 6. Kafka Consumer가 호출
  void handleReceivedMessage(ChatMessageDto messageDto);

  void leaveChatRoom(String roomId, String userId);

}