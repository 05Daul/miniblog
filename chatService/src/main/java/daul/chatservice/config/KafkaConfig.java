package daul.chatservice.config;

import com.fasterxml.jackson.databind.ser.std.StringSerializer;
import daul.chatservice.dto.ChatMessageDto;
import java.util.HashMap;
import java.util.Map;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.support.serializer.JsonSerializer;

@Configuration
public class KafkaConfig {


  /**
   * chat-events 토픽 자동 생성
   */
  @Bean
  public NewTopic chatEventsTopic() {
    return TopicBuilder.name("chat-events")
        .partitions(3)
        .replicas(1)
        .build();
  }

  /**
   * notification-events 토픽 자동 생성
   */
  @Bean
  public NewTopic notificationEventsTopic() {
    return TopicBuilder.name("notification-events")
        .partitions(3)
        .replicas(1)
        .build();
  }
}
