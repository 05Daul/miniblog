package daul.chatservice.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@NoArgsConstructor
@Data
@Builder
@AllArgsConstructor
@Document(collection = "messages")
public class ChatMessage {

  public enum MessageType {
    TALK,      // 일반 텍스트 메시지
    IMAGE,     // 이미지 메시지
    ENTER,     // 방 입장 알림
    LEAVE,     // 방 퇴장 알림
    READ       // ⭐ 읽음 처리 알림 (DB에 저장되지 않음, WebSocket 전용)
  }

  @Id
  private String chatId;
  private MessageType type; // 메시지 유형 추가

  private String userSignId; // name -> senderId (사용자 ID로 관리)
  private String name; // 편의를 위해 이름도 유지

  private String roomId;
  private String content;
  private String imageUrl; // 이미지 URL (TYPE이 IMAGE일 때 사용)
  private LocalDateTime createdAt;
  private List<String> readBy = new ArrayList<>(); // 메시지를 읽은 사용자 ID 목록
  private Boolean deleted = false; // 삭제 상태 (기본값 false)

}