package daul.blogservice.repository;

import daul.blogservice.entity.LikeEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LikeRepository extends JpaRepository<LikeEntity, Long> {


  Optional<LikeEntity> findByPostIdAndUserSignId(Long postId, String userSignId);
  // 좋아요 취소
  void deleteByPostIdAndUserSignId(Long postId, String userId);

  // 좋아요의 총갯수
  long countByPostId(Long postId);

  boolean existsByPostIdAndUserSignId(Long postId, String userId);

}
