package daul.communityservice.service;

import daul.communityservice.entity.like.LikeEntity;
import daul.communityservice.entity.tag.CommunityPostType;
import daul.communityservice.repository.LikeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class LikeServiceImpl implements LikeService {
  private final LikeRepository likeRepository;
  @Override
  public boolean toggleLike(Long communityId, CommunityPostType type, String userSignId) {
    return likeRepository.findByUserSignIdAndCommunityIdAndCommunityType(userSignId, communityId, type)
        .map(like -> {
          likeRepository.delete(like);
          return false; // 취소됨
        })
        .orElseGet(() -> {
          likeRepository.save(LikeEntity.builder()
              .communityId(communityId)
              .communityType(type)
              .userSignId(userSignId)
              .build());
          return true; // 생성됨
        });
  }

  @Override
  @Transactional(readOnly = true)
  public Long getLikeCount(Long communityId, CommunityPostType type) {
    return likeRepository.countByCommunityIdAndCommunityType(communityId, type);
  }

  @Override
  @Transactional(readOnly = true)
  public boolean isLiked(Long communityId, CommunityPostType type, String userSignId) {
    return likeRepository.existsByUserSignIdAndCommunityIdAndCommunityType(userSignId, communityId, type);
  }

  @Override
  public void deleteLikes(Long communityId, CommunityPostType type) {
    likeRepository.deleteByCommunityIdAndCommunityType(communityId, type);
  }
}
