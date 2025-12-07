package daul.chatservice.repository;

import daul.chatservice.entity.ChatRoom;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ChatRoomRepository extends MongoRepository<ChatRoom, String> {

// 사용자별 채팅방 목록 조회 (참가자 ID로 검색)
  List<ChatRoom> findByParticipantIdsContainingOrderByLastMessageTimeDesc(String userId);
  List<ChatRoom> findByParticipantIdsContaining(String userId);
  Optional<ChatRoom> findByIsOneToOneTrueAndParticipantIdsContainingAllIgnoreCase(
      List<String> participantIds);


}
