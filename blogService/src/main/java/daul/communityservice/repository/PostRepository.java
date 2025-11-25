package daul.communityservice.repository;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Pageable;
import daul.communityservice.entity.PostEntity;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostRepository extends JpaRepository<PostEntity, Long> {

  PostEntity save(PostEntity post);

  Optional<PostEntity> findById(Long id);

  @Modifying
  @Query("UPDATE PostEntity p SET p.viewCount = p.viewCount + 1 WHERE p.postId = :postId")
  int incrementViewCount(@Param("postId") Long postId);

  // 최신순 조회
  Page<PostEntity> findAllByIsPublishedTrueOrderByCreatedAtDesc(Pageable pageable);

  @Query("SELECT p FROM PostEntity p " +
      "WHERE p.isPublished = true " +
      "AND p.createdAt >= :sevenDaysAgo " + // 생성일이 7일 전 시간보다 크거나 같음
      "ORDER BY p.viewCount DESC, p.createdAt DESC")
  Page<PostEntity> findTrendingPosts(LocalDateTime sevenDaysAgo,Pageable pageable);

  @Query("SELECT p FROM PostEntity p WHERE p.isPublished = true AND p.authorId IN :authorIds ORDER BY p.createdAt DESC")
  Page<PostEntity> findFeedPostsByAuthorIds(@Param("authorIds") List<String> authorIds,
      Pageable pageable);
}
