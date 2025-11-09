package daul.notificationservice.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "notifications")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long notificationsId;

  @Column(name = "receiver_id", nullable = false)
  private Long receiverId;

  @Column(name = "sender_id", nullable = true)
  private Long senderId;

  @Column(nullable = false, length = 50)
  private String type;

  @Column(nullable = false)
  private String message;

  @Column(nullable = true)
  private Long targetId;

  @Column(name = "friendship_id", nullable = true)
  private Long friendshipId;

  @Column(nullable = false)
  private Boolean isRead = false;

  @Column(nullable = false, updatable = false)
  @CreationTimestamp
  private LocalDateTime createdAt;
}