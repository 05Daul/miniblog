package daul.blogservice.dao;

import daul.blogservice.dto.PostCreationRequestDTO;
import daul.blogservice.entity.PostEntity;
import daul.blogservice.repository.PostRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;


@Repository
@RequiredArgsConstructor
public class PostDaoImpl implements PostDao {

  private final PostRepository postRepository;

  @Override
  public int incrementViewCount(Long postId) {
    return postRepository.incrementViewCount(postId);  }

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
}
