package daul.blogservice.service;

import daul.blogservice.dto.LikeToggleResponseDTO;

public interface LikeService {
  LikeToggleResponseDTO toggleLike(Long postId, String userId);

}
