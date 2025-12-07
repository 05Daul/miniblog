package daul.chatservice.dto;

import daul.chatservice.entity.ChatMessage;
import daul.chatservice.entity.ChatMessage.MessageType;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor  // ⭐ 반드시 필요 (Jackson 역직렬화용)
@AllArgsConstructor
public class ChatMessageDto {

  private String userSignId;
  private String name;
  private String roomId;
  private String content;
  private String type; // "TALK", "IMAGE", "ENTER", "LEAVE" (String으로 받음)
  private String imageUrl;

  /**
   * DTO → Entity 변환
   */
  public ChatMessage toEntity() {
    ChatMessage message = new ChatMessage();
    message.setChatId(UUID.randomUUID().toString());

    // ⭐ String → MessageType enum 변환
    try {
      MessageType messageType = MessageType.valueOf(
          this.type != null ? this.type.toUpperCase() : "TALK"
      );
      message.setType(messageType);
    } catch (IllegalArgumentException e) {
      message.setType(MessageType.TALK);
    }

    message.setUserSignId(this.userSignId);
    message.setName(this.name);
    message.setRoomId(this.roomId);
    message.setContent(this.content);
    message.setImageUrl(this.imageUrl);
    message.setCreatedAt(LocalDateTime.now());

    // ⭐ 발신자를 readBy에 자동 추가 (본인은 이미 읽음 상태)
    List<String> readBy = new ArrayList<>();
    if (this.userSignId != null) {
      readBy.add(this.userSignId);
    }
    message.setReadBy(readBy);

    message.setDeleted(false);

    return message;
  }
}