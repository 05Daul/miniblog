package daul.communityservice.dao;

import daul.communityservice.entity.PostEntity;
import java.time.LocalDateTime;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;

public interface PostDao {

  PostEntity writePost(PostEntity post);

  PostEntity readPost(Long id);

  void deletePost(Long postId);

  Optional<PostEntity> findById(Long id);

  int incrementViewCount(Long postId);

  Page<PostEntity> getRecentPosts(Pageable pageable);

  // 트랜드 조회
  Page<PostEntity> findTrendingPosts(LocalDateTime seven, Pageable pageable);

  // 친구들 게시글 조회
  Page<PostEntity> findFeedPostsByAuthorIds(List<String> authorIds, Pageable pageable);

}
