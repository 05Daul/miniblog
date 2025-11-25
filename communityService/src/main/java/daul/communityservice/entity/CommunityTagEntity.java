package daul.communityservice.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "community_tags") // 테이블 이름을 변경하여 기존 posts의 tags 테이블과 구분
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CommunityTagEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long tagId;

  @Column(nullable = false, unique = true, length = 50)
  private String tagName;

}
