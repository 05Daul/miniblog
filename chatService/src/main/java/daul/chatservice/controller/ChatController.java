package daul.chatservice.controller;

import daul.chatservice.dto.ChatMessageDto;
import daul.chatservice.entity.ChatMessage;
import daul.chatservice.entity.ChatRoom;
import daul.chatservice.service.ChatService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/chat")
public class ChatController {

  private final ChatService chatService;

  // ============================================
  // WebSocket 메시지 핸들러
  // ============================================

  /**
   * ⭐ 클라이언트가 /app/chat.message로 메시지를 보내면 여기서 처리
   * 프론트엔드: destination: '/app/chat.message'
   */
  @MessageMapping("/chat.message")  // ⭐ 수정: /send → /chat.message
  public void sendMessage(@Payload ChatMessageDto messageDto) {
    log.info("🎯 [MessageMapping] @MessageMapping 메서드 진입!");
    log.info("📨 WebSocket 메시지 수신 - RoomId: {}, UserSignId: {}, Content: {}",
        messageDto.getRoomId(), messageDto.getUserSignId(), messageDto.getContent());
    log.info("📨 전체 메시지 DTO: {}", messageDto);

    try {
      // Kafka로 메시지 발행 (비동기 처리)
      chatService.sendMessageToKafka(messageDto);
      log.info("✅ Kafka로 메시지 발행 완료");
    } catch (Exception e) {
      log.error("❌ 메시지 처리 중 에러 발생:", e);
    }
  }

  // ============================================
  // REST API 엔드포인트
  // ============================================

  /**
   * 채팅방 생성
   */
  @PostMapping("/rooms")
  public ResponseEntity<ChatRoom> createRoom(
      @RequestHeader("userSignId") String userSignId,
      @RequestBody CreateRoomRequest request) {

    ChatRoom room = chatService.createChatRoom(userSignId, request.getParticipantIds(),
        request.getRoomName());
    return ResponseEntity.ok(room);
  }

  @DeleteMapping("/rooms/{roomId}/leave")
  public ResponseEntity<Void> leaveChatRoom(
      @PathVariable String roomId,
      @RequestHeader("userSignId") String userSignId) {

    log.info("🚪 [API] 채팅방 나가기 요청 - RoomId: {}, UserId: {}", roomId, userSignId);
    chatService.leaveChatRoom(roomId, userSignId);
    return ResponseEntity.ok().build();
  }


  /**
   * 사용자별 채팅방 목록 조회
   */
  @GetMapping("/rooms")
  public List<ChatRoom> getUserRooms(
      @RequestHeader("userSignId") String userSignId) {
    log.info("🔍 [API] 사용자별 채팅방 목록 조회 요청 수신. UserSignId: {}", userSignId);
    List<ChatRoom> rooms = chatService.getUserChatRooms(userSignId);

    // ⭐ 각 채팅방의 안읽은 메시지 개수 추가 (ChatRoom 객체에 직접 설정)
    rooms.forEach(room -> {
      long unreadCount = chatService.getUnreadMessageCount(room.getRoomId(), userSignId);
      // ChatRoom 엔티티에 transient 필드로 추가 필요
      room.setUnreadCount(unreadCount);
    });

    log.info("📊 [API] ChatService 응답 결과: Room 개수 = {}", rooms.size());
    return rooms;
  }

  /**
   * 채팅 히스토리 조회
   */
  @GetMapping("/rooms/{roomId}/messages")
  public ResponseEntity<List<ChatMessage>> getChatHistory(
      @PathVariable String roomId,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "50") int size) {

    List<ChatMessage> messages = chatService.getChatHistory(roomId, page, size);
    return ResponseEntity.ok(messages);
  }

  /**
   * 메시지 읽음 처리
   */
  @PutMapping("/rooms/{roomId}/read")
  public ResponseEntity<Void> markAsRead(
      @PathVariable String roomId,
      @RequestHeader("userSignId") String userSignId) {

    chatService.markMessageAsRead(roomId, userSignId);
    return ResponseEntity.ok().build();
  }

  // ============================================
  // 내부 DTO 클래스
  // ============================================

  @lombok.Data
  public static class CreateRoomRequest {
    private List<String> participantIds;
    private String roomName;
  }
}