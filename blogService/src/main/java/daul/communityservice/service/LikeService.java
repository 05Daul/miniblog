package daul.communityservice.service;

import daul.communityservice.dto.LikeToggleResponseDTO;

public interface LikeService {
  LikeToggleResponseDTO toggleLike(Long postId, String userId);

}
