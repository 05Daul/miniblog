package daul.blogservice.repository;

import daul.blogservice.entity.PostEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostRepository extends JpaRepository<PostEntity,Long> {
  PostEntity save(PostEntity post);
  Optional<PostEntity> findById(Long id);
  @Modifying
  @Query("UPDATE PostEntity p SET p.viewCount = p.viewCount + 1 WHERE p.postId = :postId")
  int incrementViewCount(@Param("postId") Long postId);

}
