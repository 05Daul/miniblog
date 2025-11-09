package daul.chatservice.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@NoArgsConstructor
@Data
@AllArgsConstructor
@Document(collection = "messages")  //  MongoDB 컬렉션
public class ChatMessage {

  @Id
  private String chatId;
  private String name;
  private String roomId;
  private String content;
  private String imageUrl;
  private LocalDateTime createdAt;
  private List<String> readBy = new ArrayList<>();
  private Boolean deleted;

}

