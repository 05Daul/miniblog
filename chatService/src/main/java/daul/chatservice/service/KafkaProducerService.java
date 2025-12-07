package daul.chatservice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import daul.chatservice.dto.ChatMessageDto;
import daul.chatservice.entity.ChatMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class KafkaProducerService {

  private final KafkaTemplate<String, Object> kafkaTemplate;
  private final ObjectMapper objectMapper;

  /**
   * 채팅 메시지(Entity)를 Kafka로 발행
   */
  public void sendChatMessage(String topic, ChatMessage message) {
    try {
      kafkaTemplate.send(topic, message.getRoomId(), message);
      log.info("✅ Kafka 메시지 발행 성공 - Topic: {}, RoomId: {}", topic, message.getRoomId());
    } catch (Exception e) {
      log.error("❌ Kafka 메시지 발행 실패: {}", e.getMessage(), e);
      throw new RuntimeException("메시지 발행 실패", e);
    }
  }

  /**
   * ⭐ 채팅 메시지(DTO)를 Kafka로 발행
   */
  public void sendChatMessageDto(String topic, ChatMessageDto messageDto) {
    try {
      kafkaTemplate.send(topic, messageDto.getRoomId(), messageDto);
      log.info("✅ Kafka 메시지(DTO) 발행 성공 - Topic: {}, RoomId: {}", topic, messageDto.getRoomId());
    } catch (Exception e) {
      log.error("❌ Kafka 메시지 발행 실패: {}", e.getMessage(), e);
      throw new RuntimeException("메시지 발행 실패", e);
    }
  }

  /**
   * 알림 이벤트를 Notification Service로 발행
   */
  public void sendNotificationEvent(String topic, Object notificationEvent) {
    try {
      kafkaTemplate.send(topic, notificationEvent);
      log.info("✅ 알림 이벤트 발행 성공 - Topic: {}", topic);
    } catch (Exception e) {
      log.error("❌ 알림 이벤트 발행 실패: {}", e.getMessage(), e);
    }
  }
}