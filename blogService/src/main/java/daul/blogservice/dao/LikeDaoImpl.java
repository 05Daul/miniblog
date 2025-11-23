package daul.blogservice.dao;

import daul.blogservice.entity.LikeEntity;
import daul.blogservice.repository.LikeRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class LikeDaoImpl implements LikeDao {

  private final LikeRepository likeRepository;

  @Override
  public LikeEntity save(LikeEntity likeEntity) {
    return likeRepository.save(likeEntity);
  }

  @Override
  public long countByPostId(Long postId) {
    return likeRepository.countByPostId(postId);
  }

  @Override
  public Optional<LikeEntity> findByPostIdAndUserSignId(Long postId, String userSignId) {
    return likeRepository.findByPostIdAndUserSignId(postId, userSignId);

  }
  @Override
  public void deleteByPostIdAndUserId(Long postId, String userId) {
    likeRepository.deleteByPostIdAndUserSignId(postId, userId);
  }

  @Override
  public boolean existsByPostIdAndUserId(Long postId, String userId) {
    return likeRepository.existsByPostIdAndUserSignId(postId, userId);
  }
}
