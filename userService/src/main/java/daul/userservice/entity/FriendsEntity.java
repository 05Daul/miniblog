package daul.userservice.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;


@Entity
@Table(name = "frineds_Entity")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FriendsEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long friendId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private UsersEntity requester;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "req_friend_id", nullable = false)
  private UsersEntity receiver;

  @Enumerated(EnumType.STRING)
  @Column(nullable = true)
  private FriendsStatus friendsStatus;

  @Column(nullable = false)
  @CreationTimestamp
  private LocalDateTime createdAt;

  @Column(nullable = true)
  @UpdateTimestamp
  private LocalDateTime updatedAt;


}
