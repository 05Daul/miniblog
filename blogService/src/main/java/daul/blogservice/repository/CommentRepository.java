package daul.blogservice.repository;

import daul.blogservice.entity.CommentEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface CommentRepository extends JpaRepository<CommentEntity, Long> {

  @Query("SELECT c FROM CommentEntity c WHERE c.postId = :postId AND c.parentComment IS NULL ORDER BY c.createdAt ASC")
  List<CommentEntity> findTopLevelCommentsByPostId(Long postId);

  List<CommentEntity> findByParentComment_CommentIdOrderByCreatedAtAsc(Long parentId);

  Long countByPostIdAndIsDeletedFalse(Long postId);
}
