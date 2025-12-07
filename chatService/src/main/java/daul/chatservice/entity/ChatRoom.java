package daul.chatservice.entity;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "rooms")
public class ChatRoom {
    @Id
    private String roomId;

    private String roomName;
    private List<String> participantIds;
    private String creatorId;
    private LocalDateTime createdAt;

    // 마지막 메시지 정보
    private String lastMessageContent;
    private LocalDateTime lastMessageTime;
    private String lastMessageSenderId;

    // 1:1 채팅 여부
    private Boolean isOneToOne = false;

    // ⭐ 안읽은 메시지 개수 (DB에 저장되지 않음, API 응답용)
    @Transient
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Long unreadCount;
}