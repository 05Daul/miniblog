package daul.blogservice.dao;

import daul.blogservice.dto.PostCreationRequestDTO;
import java.time.LocalDateTime;
import org.springframework.data.domain.Pageable;
import daul.blogservice.entity.PostEntity;
import daul.blogservice.repository.PostRepository;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Repository;


@Repository
@RequiredArgsConstructor
public class PostDaoImpl implements PostDao {

  private final PostRepository postRepository;

  @Override
  public int incrementViewCount(Long postId) {
    return postRepository.incrementViewCount(postId);
  }

  @Override
  public Optional<PostEntity> findById(Long id) {
    return postRepository.findById(id);
  }


  @Override
  public void deletePost(Long postId) {
    postRepository.deleteById(postId);
  }

  @Override
  public PostEntity writePost(PostEntity post) {
    return postRepository.save(post);
  }

  @Override
  public Page<PostEntity> findFeedPostsByAuthorIds(List<String> authorIds, Pageable pageable) {
    return postRepository.findFeedPostsByAuthorIds(authorIds, pageable);
  }

  @Override
  public Page<PostEntity> getRecentPosts(Pageable pageable) {
    return postRepository.findAllByIsPublishedTrueOrderByCreatedAtDesc(pageable);
  }

  @Override
  public Page<PostEntity> findTrendingPosts(LocalDateTime sevenDaysAgo,Pageable pageable) {
    return postRepository.findTrendingPosts(sevenDaysAgo,pageable);
  }

  @Override
  public PostEntity readPost(Long id) {
    return postRepository.findById(id).orElse(null);
  }
}
