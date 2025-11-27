package daul.communityservice.repository;

import daul.communityservice.entity.CommunityPostType;
import daul.communityservice.entity.LikeEntity;
import java.util.List;
import org.apache.el.stream.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LikeRepository extends JpaRepository<LikeEntity,Long> {

  // 좋아요 존재 여부 확인
  boolean existsByUserSignIdAndCommunityIdAndCommunityType(
      String userSignId, Long communityId, CommunityPostType communityType);

  // 특정 게시글의 좋아요 개수
  Long countByCommunityIdAndCommunityType(Long communityId, CommunityPostType communityType);

  // 특정 게시글의 모든 좋아요
  List<LikeEntity> findByCommunityIdAndCommunityType(Long communityId, CommunityPostType communityType);

  // 특정 사용자가 누른 모든 좋아요
  List<LikeEntity> findByUserSignId(String userSignId);

  // 특정 사용자가 특정 타입에 누른 좋아요
  List<LikeEntity> findByUserSignIdAndCommunityType(String userSignId, CommunityPostType communityType);

  // 특정 사용자의 좋아요 개수
  Long countByUserSignId(String userSignId);

  // 좋아요 삭제
  void deleteByUserSignIdAndCommunityIdAndCommunityType(
      String userSignId, Long communityId, CommunityPostType communityType);

  // 특정 게시글의 모든 좋아요 삭제 (게시글 삭제 시 사용)
  void deleteByCommunityIdAndCommunityType(Long communityId, CommunityPostType communityType);

  // 인기 게시글 조회 (좋아요 많은 순)
  @Query("SELECT l.communityId, l.communityType, COUNT(l) as likeCount " +
      "FROM LikeEntity l " +
      "WHERE l.communityType = :communityType " +
      "GROUP BY l.communityId, l.communityType " +
      "ORDER BY likeCount DESC")
  List<Object[]> findTopLikedPosts(@Param("communityType") CommunityPostType communityType);

}
