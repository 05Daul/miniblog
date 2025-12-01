package daul.communityservice.service;

import daul.communityservice.dto.CommentResponse;
import daul.communityservice.dto.CreateCommentRequest;
import daul.communityservice.dto.UpdateCommentRequest;
import daul.communityservice.entity.comment.CommentEntity;
import daul.communityservice.entity.tag.CommunityPostType;
import daul.communityservice.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

  private final CommentRepository commentRepository;

  @Override
  @Transactional(readOnly = true)
  public Long getCommentCount(Long communityId, CommunityPostType type) {
    return commentRepository.countByCommunityIdAndCommunityTypeAndIsDeleted(communityId, type, false);
  }

  @Override
  public Long createComment(Long communityId, CommunityPostType type,
      CreateCommentRequest request, String userId) {

    // 1. 대댓글인 경우 부모 댓글 검증
    if (request.getParentCommentId() != null) {
      CommentEntity parentComment = commentRepository.findById(request.getParentCommentId())
          .orElseThrow(() -> new IllegalArgumentException(
              "부모 댓글을 찾을 수 없습니다. ID: " + request.getParentCommentId()));

      // 부모 댓글의 communityId와 type이 일치하는지 확인
      if (!parentComment.getCommunityId().equals(communityId)
          || !parentComment.getCommunityType().equals(type)) {
        throw new IllegalArgumentException("부모 댓글이 해당 게시글에 속하지 않습니다.");
      }

      // 부모 댓글이 삭제된 상태인지 확인
      if (parentComment.getIsDeleted()) {
        throw new IllegalStateException("삭제된 댓글에는 답글을 작성할 수 없습니다.");
      }
    }

    // 2. CommentEntity 생성 및 저장
    CommentEntity newComment = CommentEntity.builder()
        .communityId(communityId)
        .communityType(type)
        .userId(userId)
        .content(request.getContent())
        .parentCommentId(request.getParentCommentId())
        .isDeleted(false)
        .build();

    CommentEntity savedComment = commentRepository.save(newComment);

    // 3. 생성된 댓글의 ID 반환
    return savedComment.getCommentId();
  }

  @Override
  @Transactional(readOnly = true)
  public List<CommentResponse> getComments(Long communityId, CommunityPostType type) {
    // 1. 해당 게시글의 활성화된 모든 댓글 조회 (삭제되지 않은 댓글만)
    List<CommentEntity> allComments = commentRepository.findActiveCommunityComments(communityId, type);

    // 2. 모든 대댓글들을 부모 ID로 그룹화합니다. (2차, 3차 등 모든 대댓글이 부모 ID 기준으로 들어갑니다.)
    Map<Long, List<CommentEntity>> repliesMap = allComments.stream()
        .filter(CommentEntity::isReply)
        .collect(Collectors.groupingBy(CommentEntity::getParentCommentId));

    // 3. 최상위 댓글만 필터링하고 재귀 함수를 이용해 N단계 계층 구조를 조립합니다.
    return allComments.stream()
        .filter(comment -> !comment.isReply()) // 최상위 댓글 (parentCommentId == null)만 선택
        .map(rootComment -> buildCommentTree(rootComment, repliesMap))
        .collect(Collectors.toList());
  }

  /**
   * 댓글 계층 구조를 재귀적으로 빌드하는 헬퍼 메서드.
   * 모든 레벨의 대댓글을 해당 부모 댓글의 replies 리스트에 연결합니다.
   * (CommentResponse::fromWithReplies는 CommentEntity와 List<CommentResponse>를 받아 CommentResponse를 생성한다고 가정합니다.)
   */
  private CommentResponse buildCommentTree(CommentEntity currentComment,
      Map<Long, List<CommentEntity>> repliesMap) {

    // 1. 현재 댓글의 ID를 부모 ID로 가진 자식 댓글 엔티티 목록을 가져옵니다.
    List<CommentEntity> childEntities = repliesMap.getOrDefault(currentComment.getCommentId(), List.of());

    // 2. 각 자식 댓글 엔티티에 대해 재귀적으로 이 함수를 호출하여 하위 트리를 생성합니다.
    List<CommentResponse> childResponses = childEntities.stream()
        .map(childEntity -> buildCommentTree(childEntity, repliesMap))
        .collect(Collectors.toList());

    // 3. 현재 댓글 엔티티와 재귀적으로 생성된 자식 응답 목록을 사용하여 CommentResponse를 생성합니다.
    return CommentResponse.fromWithReplies(currentComment, childResponses);
  }

  @Override
  @Transactional(readOnly = true)
  public List<CommentResponse> getReplies(Long parentCommentId) {
    // 특정 댓글의 대댓글 조회
    List<CommentEntity> replies = commentRepository.findByParentCommentId(parentCommentId);

    return replies.stream()
        .filter(reply -> !reply.getIsDeleted()) // 삭제되지 않은 대댓글만
        .map(CommentResponse::from)
        .collect(Collectors.toList());
  }

  @Override
  public void deleteComment(Long communityId, CommunityPostType type, Long commentId,
      String userId) {
    CommentEntity comment = commentRepository.findById(commentId)
        .orElseThrow(() -> new IllegalArgumentException("댓글을 찾을 수 없습니다. ID: " + commentId));

    if (!comment.getUserId().equals(userId)) {
      throw new IllegalStateException("댓글 삭제 권한이 없습니다.");
    }
    if (!comment.getCommunityId().equals(communityId) || !comment.getCommunityType().equals(type)) {
      throw new IllegalArgumentException("요청 정보가 댓글과 일치하지 않습니다.");
    }

    comment.setIsDeleted(true);

  }

  @Override
  public void updateComment(Long communityId, CommunityPostType type, Long commentId,
      UpdateCommentRequest request, String userId) {

    CommentEntity comment = commentRepository.findById(commentId)
        .orElseThrow(() -> new IllegalArgumentException("댓글을 찾을 수 없습니다. ID: " + commentId));

    if (!comment.getUserId().equals(userId)) {
      throw new IllegalStateException("댓글 수정 권한이 없습니다.");
    }

    if (!comment.getCommunityId().equals(communityId) || !comment.getCommunityType().equals(type)) {
      throw new IllegalArgumentException("요청 정보가 댓글과 일치하지 않습니다.");
    }

    comment.setContent(request.getContent());
  }
}