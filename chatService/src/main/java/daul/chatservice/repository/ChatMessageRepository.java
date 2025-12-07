package daul.chatservice.repository;

import daul.chatservice.entity.ChatMessage;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {

  //메세지 가져오가
  List<ChatMessage> findByRoomIdOrderByCreatedAtDesc(String roomId);

  //읽기 카운트
  long countByRoomIdAndReadByNotContains(String roomId, String userId);
  void deleteByRoomId(String roomId);

}
