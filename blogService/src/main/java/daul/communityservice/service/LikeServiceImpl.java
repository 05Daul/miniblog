package daul.communityservice.service;

import daul.communityservice.dao.LikeDao;
import daul.communityservice.dto.LikeToggleResponseDTO;
import daul.communityservice.entity.LikeEntity;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LikeServiceImpl implements LikeService {

  private final LikeDao likeDao;

  @Override
  @Transactional
  public LikeToggleResponseDTO toggleLike(Long postId, String userId) {
    Optional<LikeEntity> existingLike = likeDao.findByPostIdAndUserSignId(postId, userId);

    boolean isLiked;

    if (existingLike.isPresent()) {
      likeDao.deleteByPostIdAndUserId(postId, userId); // 엔티티 삭제
      isLiked = false;
    } else {
      LikeEntity newLike = LikeEntity.builder()
          .postId(postId)
          .userSignId(userId)
          .build();
      likeDao.save(newLike);
      isLiked = true;
    }
    long newLikeCount = likeDao.countByPostId(postId);

    return new LikeToggleResponseDTO(isLiked, newLikeCount);
  }
}
