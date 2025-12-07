package daul.chatservice.service;

import daul.chatservice.dto.ChatMessageDto;
import daul.chatservice.entity.ChatMessage;
import daul.chatservice.entity.ChatRoom;
import daul.chatservice.repository.ChatMessageRepository;
import daul.chatservice.repository.ChatRoomRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

  private final ChatRoomRepository chatRoomRepository;
  private final ChatMessageRepository chatMessageRepository;
  private final KafkaProducerService kafkaProducerService;
  private final SimpMessageSendingOperations messagingTemplate;
  private final MongoTemplate mongoTemplate;

  private static final String CHAT_TOPIC = "chat-events";
  private static final String NOTIFICATION_TOPIC = "notification-events";

  @Override
  @Transactional
  public ChatRoom createChatRoom(String creatorId, List<String> participantIds, String roomName) {

    ChatRoom newRoom = new ChatRoom();

    if (!participantIds.contains(creatorId)) {
      participantIds.add(creatorId);
    }
    newRoom.setRoomId(UUID.randomUUID().toString());
    newRoom.setRoomName(roomName);
    newRoom.setParticipantIds(participantIds);
    newRoom.setCreatorId(creatorId);
    newRoom.setCreatedAt(LocalDateTime.now());
    newRoom.setIsOneToOne(participantIds.size() == 2);

    return chatRoomRepository.save(newRoom);
  }

  @Override
  public void sendMessageToKafka(ChatMessageDto messageDto) {
    log.info("📤 Kafka로 메시지 발행 시작 - RoomId: {}", messageDto.getRoomId());
    kafkaProducerService.sendChatMessageDto(CHAT_TOPIC, messageDto);
  }

  @Override
  @Transactional
  public void handleReceivedMessage(ChatMessageDto messageDto) {
    ChatMessage message = messageDto.toEntity();

    // 1. DB 저장
    ChatMessage savedMessage = chatMessageRepository.save(message);
    log.info("💾 메시지 DB 저장 완료 - ChatId: {}", savedMessage.getChatId());

    // 2. 채팅방 정보 업데이트
    chatRoomRepository.findById(savedMessage.getRoomId()).ifPresent(room -> {
      room.setLastMessageContent(savedMessage.getContent());
      room.setLastMessageTime(savedMessage.getCreatedAt());
      room.setLastMessageSenderId(savedMessage.getUserSignId());
      chatRoomRepository.save(room);
    });

    // 3. WebSocket으로 실시간 푸시
    String destination = "/topic/chat.room." + savedMessage.getRoomId();

    log.info("📡 WebSocket 브로드캐스트 시작 - Destination: {}", destination);
    messagingTemplate.convertAndSend(destination, savedMessage);
    log.info("✅ WebSocket 푸시 완료 - RoomId: {}", savedMessage.getRoomId());

    // 4. 알림 서비스로 이벤트 발행
    sendChatNotification(savedMessage);
  }

  @Override
  public List<ChatMessage> getChatHistory(String roomId, int page, int size) {
    return chatMessageRepository.findByRoomIdOrderByCreatedAtDesc(roomId);
  }

  @Override
  @Transactional
  public void markMessageAsRead(String roomId, String userId) {
    try {
      log.info("📖 메시지 읽음 처리 시작 - RoomId: {}, UserId: {}", roomId, userId);

      // MongoDB의 readBy 배열에 userId 추가 (중복 방지)
      Query query = new Query();
      query.addCriteria(Criteria.where("roomId").is(roomId)
          .and("readBy").ne(userId)  // 이미 읽은 메시지는 제외
          .and("userSignId").ne(userId)  // ⭐ 본인이 보낸 메시지는 제외 (중요!)
          .and("deleted").is(false)); // 삭제되지 않은 메시지만

      Update update = new Update();
      update.addToSet("readBy", userId);  // 배열에 userId 추가 (중복 방지)

      var result = mongoTemplate.updateMulti(query, update, ChatMessage.class);

      log.info("✅ 읽음 처리 완료 - 업데이트된 메시지: {}개", result.getModifiedCount());

      // ⭐ 실시간 읽음 알림: 다른 사용자에게 "상대방이 읽었음" 브로드캐스트
      if (result.getModifiedCount() > 0) {
        String destination = "/topic/chat.room." + roomId;

        ReadReceiptEvent readEvent = ReadReceiptEvent.builder()
            .type("READ")
            .roomId(roomId)
            .userSignId(userId)
            .readAt(LocalDateTime.now())
            .build();

        messagingTemplate.convertAndSend(destination, readEvent);
        log.info("📢 읽음 알림 브로드캐스트 완료 - UserId: {}", userId);
      }

    } catch (Exception e) {
      log.error("❌ 읽음 처리 실패: {}", e.getMessage(), e);
    }
  }

  @Override
  public List<ChatRoom> getUserChatRooms(String userId) {
    return chatRoomRepository.findByParticipantIdsContaining(userId);
  }

  /**
   * ⭐ 안읽은 메시지 개수 조회
   */
  public long getUnreadMessageCount(String roomId, String userId) {
    return chatMessageRepository.countByRoomIdAndReadByNotContains(roomId, userId);
  }

  /**
   * 채팅 알림 이벤트 발행
   */
  private void sendChatNotification(ChatMessage message) {
    try {
      ChatNotificationEvent event = ChatNotificationEvent.builder()
          .type("CHAT_MESSAGE")
          .senderId(message.getUserSignId())
          .senderName(message.getName())
          .roomId(message.getRoomId())
          .messageContent(message.getContent())
          .createdAt(message.getCreatedAt())
          .build();

      kafkaProducerService.sendNotificationEvent(NOTIFICATION_TOPIC, event);
      log.info("🔔 채팅 알림 이벤트 발행 - RoomId: {}", message.getRoomId());
    } catch (Exception e) {
      log.error("❌ 채팅 알림 발행 실패: {}", e.getMessage());
    }


  }

  // ============================================
  // 내부 클래스
  // ============================================

  @lombok.Data
  @lombok.Builder
  public static class ChatNotificationEvent {
    private String type;
    private String senderId;
    private String senderName;
    private String roomId;
    private String messageContent;
    private LocalDateTime createdAt;
  }

  @Override
  @Transactional
  public void leaveChatRoom(String roomId, String userId) {
    try {
      log.info("🚪 채팅방 나가기 시작 - RoomId: {}, UserId: {}", roomId, userId);

      ChatRoom room = chatRoomRepository.findById(roomId)
          .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다."));

      // 1. participantIds에서 사용자 제거
      if (!room.getParticipantIds().contains(userId)) {
        log.warn("⚠️ 이미 나간 채팅방입니다 - UserId: {}", userId);
        return;
      }

      room.getParticipantIds().remove(userId);

      // 2. 퇴장 메시지 전송 (선택사항)
      ChatMessageDto leaveMessage = ChatMessageDto.builder()
          .roomId(roomId)
          .userSignId(userId)
          .name(userId)
          .content(userId + "님이 채팅방을 나갔습니다.")
          .type("LEAVE")
          .build();

      sendMessageToKafka(leaveMessage);

      // 3. 남은 참여자가 없으면 채팅방 삭제
      if (room.getParticipantIds().isEmpty()) {
        log.info("🗑️ 모든 참여자가 나갔으므로 채팅방 삭제 - RoomId: {}", roomId);
        chatRoomRepository.delete(room);

        // 메시지도 모두 삭제
        chatMessageRepository.deleteByRoomId(roomId);
      } else {
        // 참여자가 남아있으면 채팅방 정보만 업데이트
        chatRoomRepository.save(room);
        log.info("✅ 채팅방 나가기 완료 - 남은 참여자: {}명", room.getParticipantIds().size());
      }

    } catch (Exception e) {
      log.error("❌ 채팅방 나가기 실패: {}", e.getMessage(), e);
      throw new RuntimeException("채팅방 나가기에 실패했습니다.", e);
    }
  }

  @lombok.Data
  @lombok.AllArgsConstructor
  @lombok.NoArgsConstructor
  @lombok.Builder
  public static class ReadReceiptEvent {
    private String type = "READ";      // ⭐ 프론트엔드에서 type으로 구분
    private String roomId;
    private String userSignId;         // ⭐ userId → userSignId (프론트와 일치)
    private LocalDateTime readAt;
  }
}