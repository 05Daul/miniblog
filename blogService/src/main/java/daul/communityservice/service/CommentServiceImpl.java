package daul.communityservice.service;

import daul.communityservice.dao.CommentDao;
import daul.communityservice.dao.PostDao;
import daul.communityservice.dto.CommentCreationRequestDTO;
import daul.communityservice.dto.CommentDTO;
import daul.communityservice.dto.CommentUpdateRequestDTO;
import daul.communityservice.entity.CommentEntity;
import daul.communityservice.entity.PostEntity;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class CommentServiceImpl implements CommentService {

  private final CommentDao commentDao;
  private final PostDao postDao;

  @Override
  @Transactional
  public CommentDTO createComment(String userId, CommentCreationRequestDTO dto) {
    // 게시글 존재 확인
    PostEntity post = postDao.findById(dto.getPostId())
        .orElseThrow(() -> new IllegalArgumentException("게시글이 존재하지 않습니다."));

    CommentEntity comment = new CommentEntity();
    comment.setPostId(dto.getPostId());
    comment.setUserId(userId);
    comment.setContent(dto.getContent());
    comment.setIsDeleted(false);

    // 대댓글인 경우 부모 댓글 설정
    if (dto.getParentId() != null) {
      CommentEntity parentComment = commentDao.findById(dto.getParentId())
          .orElseThrow(() -> new IllegalArgumentException("부모 댓글이 존재하지 않습니다."));
      comment.setParentComment(parentComment);
    }

    CommentEntity savedComment = commentDao.save(comment);
    return convertToDTO(savedComment);
  }

  @Override
  @Transactional
  public CommentDTO updateComment(Long commentId, String userId, CommentUpdateRequestDTO dto) {
    CommentEntity comment = commentDao.findById(commentId)
        .orElseThrow(() -> new IllegalArgumentException("댓글이 존재하지 않습니다."));

    // 작성자 확인
    if (!comment.getUserId().equals(userId)) {
      throw new IllegalStateException("댓글 수정 권한이 없습니다.");
    }

    // 삭제된 댓글 수정 불가
    if (comment.getIsDeleted()) {
      throw new IllegalStateException("삭제된 댓글은 수정할 수 없습니다.");
    }

    comment.setContent(dto.getContent());
    CommentEntity updatedComment = commentDao.save(comment);
    return convertToDTO(updatedComment);
  }

  @Override
  @Transactional
  public void deleteComment(Long commentId, String userId) {
    CommentEntity comment = commentDao.findById(commentId)
        .orElseThrow(() -> new IllegalArgumentException("댓글이 존재하지 않습니다."));

    // 작성자 확인
    if (!comment.getUserId().equals(userId)) {
      throw new IllegalStateException("댓글 삭제 권한이 없습니다.");
    }

    // 소프트 삭제 (대댓글이 있는 경우 내용만 변경)
    if (!comment.getChildComments().isEmpty()) {
      comment.setContent("삭제된 댓글입니다.");
      comment.setIsDeleted(true);
      commentDao.save(comment);
    } else {
      // 대댓글이 없으면 실제 삭제
      commentDao.deleteById(commentId);
    }
  }

  @Override
  @Transactional(readOnly = true)
  public List<CommentDTO> getCommentsByPostId(Long postId) {
    List<CommentEntity> topLevelComments = commentDao.findTopLevelCommentsByPostId(postId);

    return topLevelComments.stream()
        .map(this::convertToDTOWithChildren)
        .collect(Collectors.toList());
  }

  @Override
  @Transactional(readOnly = true)
  public CommentDTO getCommentById(Long commentId) {
    CommentEntity comment = commentDao.findById(commentId)
        .orElseThrow(() -> new IllegalArgumentException("댓글이 존재하지 않습니다."));
    return convertToDTOWithChildren(comment);
  }

  @Override
  @Transactional(readOnly = true)
  public Long getCommentCount(Long postId) {
    return commentDao.countByPostId(postId);
  }

  private CommentDTO convertToDTOWithChildren(CommentEntity entity) {
    List<CommentDTO> children = entity.getChildComments().stream()
        .map(this::convertToDTOWithChildren)
        .collect(Collectors.toList());

    return CommentDTO.builder()
        .commentId(entity.getCommentId())
        .postId(entity.getPostId())
        .userId(entity.getUserId())
        .parentId(
            entity.getParentComment() != null ? entity.getParentComment().getCommentId() : null)
        .content(entity.getContent())
        .isDeleted(entity.getIsDeleted())
        .createdAt(entity.getCreatedAt())
        .updatedAt(entity.getUpdatedAt())
        .childComments(children)
        .childCount(children.size())
        .build();
  }

  private CommentDTO convertToDTO(CommentEntity entity) {
    return CommentDTO.builder()
        .commentId(entity.getCommentId())
        .postId(entity.getPostId())
        .userId(entity.getUserId())
        .parentId(
            entity.getParentComment() != null ? entity.getParentComment().getCommentId() : null)
        .content(entity.getContent())
        .isDeleted(entity.getIsDeleted())
        .createdAt(entity.getCreatedAt())
        .updatedAt(entity.getUpdatedAt())
        .childCount(0)
        .build();
  }

}
