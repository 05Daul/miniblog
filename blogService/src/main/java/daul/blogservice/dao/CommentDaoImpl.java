package daul.blogservice.dao;

import daul.blogservice.entity.CommentEntity;
import daul.blogservice.repository.CommentRepository;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class CommentDaoImpl implements CommentDao{
  private final CommentRepository commentRepository;

  @Override
  public CommentEntity save(CommentEntity comment) {
    return commentRepository.save(comment);
  }

  @Override
  public Optional<CommentEntity> findById(Long commentId) {
    return commentRepository.findById(commentId);
  }

  @Override
  public List<CommentEntity> findTopLevelCommentsByPostId(Long postId) {
    return commentRepository.findTopLevelCommentsByPostId(postId);
  }

  @Override
  public List<CommentEntity> findRepliesByParentId(Long parentId) {
    return commentRepository.findByParentComment_CommentIdOrderByCreatedAtAsc(parentId);
  }

  @Override
  public void deleteById(Long commentId) {
    commentRepository.deleteById(commentId);
  }

  @Override
  public Long countByPostId(Long postId) {
    return commentRepository.countByPostIdAndIsDeletedFalse(postId);
  }

}
