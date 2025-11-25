package daul.communityservice.dao;

import daul.communityservice.entity.LikeEntity;
import java.util.Optional;

public interface LikeDao {

  LikeEntity save(LikeEntity likeEntity);

  Optional<LikeEntity> findByPostIdAndUserSignId(Long postId, String userSignId);

  // 좋아요 취소
  void deleteByPostIdAndUserId(Long postId, String userId);

  // 좋아요의 총갯수
  long countByPostId(Long postId);

  boolean existsByPostIdAndUserId(Long postId, String userId);


}
