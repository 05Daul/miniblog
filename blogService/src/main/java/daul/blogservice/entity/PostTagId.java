package daul.blogservice.entity;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter; /**
 * 해당 엔터티는 posts 테이블과 tags 테이블을 연결하는 post_tags 테이블과 매핑되는 엔티티
 *
 * @Embeddable 으로 복합키 클래스 구현 하단을 보면 "복합 키 객체"를 엔티티에 포함시켜 사용함.
 * @EmbeddedId 필드가 엔티티의 기본 키 역할을 수행하며 필요에 따라 **@AttributeOverrides**를 함께 사용하여 포함된 필드와 DB 컬럼 간의 매핑을
 * 명확하게 지정
 */
@Embeddable
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode
@AllArgsConstructor
public class PostTagId implements Serializable {

  private Long postId;
  private Long tagId;
}
