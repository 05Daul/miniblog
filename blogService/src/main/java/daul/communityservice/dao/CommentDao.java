package daul.communityservice.dao;

import daul.communityservice.entity.CommentEntity;
import java.util.List;
import java.util.Optional;

public interface CommentDao {
   CommentEntity save(CommentEntity comment) ;
   Optional<CommentEntity> findById(Long commentId);
   List<CommentEntity> findTopLevelCommentsByPostId(Long postId);
   List<CommentEntity> findRepliesByParentId(Long parentId) ;
   void deleteById(Long commentId) ;
   Long countByPostId(Long postId);
}
