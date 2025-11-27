package daul.communityservice.repository;

import daul.communityservice.entity.CommentEntity;
import daul.communityservice.entity.CommunityPostType;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CommentRepository extends JpaRepository<CommentEntity, Long> {

  // 특정 게시글의 모든 댓글 조회
  List<CommentEntity> findByCommunityIdAndCommunityType(Long communityId, CommunityPostType communityType);

  // 특정 게시글의 최상위 댓글만 조회 (대댓글 제외)
  List<CommentEntity> findByCommunityIdAndCommunityTypeAndParentCommentIsNull(
      Long communityId, CommunityPostType communityType);

  // 페이징 처리된 최상위 댓글
  Page<CommentEntity> findByCommunityIdAndCommunityTypeAndParentCommentIsNull(
      Long communityId, CommunityPostType communityType, Pageable pageable);

  // 특정 댓글의 대댓글 조회
  List<CommentEntity> findByParentComment(CommentEntity parentComment);

  // 사용자가 작성한 댓글 조회
  List<CommentEntity> findByUserId(String userId);
  Page<CommentEntity> findByUserId(String userId, Pageable pageable);

  // 사용자가 특정 게시글에 작성한 댓글
  List<CommentEntity> findByUserIdAndCommunityIdAndCommunityType(
      String userId, Long communityId, CommunityPostType communityType);

  // 삭제되지 않은 댓글만 조회
  List<CommentEntity> findByCommunityIdAndCommunityTypeAndIsDeleted(
      Long communityId, CommunityPostType communityType, Boolean isDeleted);

  @Query("SELECT c FROM CommentEntity c WHERE c.communityId = :communityId " +
      "AND c.communityType = :communityType AND c.isDeleted = false " +
      "ORDER BY c.createdAt ASC, c.commentId ASC")
  List<CommentEntity> findActiveCommunityComments(
      @Param("communityId") Long communityId,
      @Param("communityType") CommunityPostType communityType);

  // 댓글 수 카운트
  Long countByCommunityIdAndCommunityType(Long communityId, CommunityPostType communityType);
  Long countByCommunityIdAndCommunityTypeAndIsDeleted(
      Long communityId, CommunityPostType communityType, Boolean isDeleted);

  // 특정 사용자의 댓글 수
  Long countByUserId(String userId);


}
