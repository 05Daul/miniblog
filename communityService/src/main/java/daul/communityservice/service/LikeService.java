package daul.communityservice.service;

import daul.communityservice.entity.tag.CommunityPostType;

public interface LikeService {
  boolean toggleLike(Long communityId, CommunityPostType type, String userSignId);
  Long getLikeCount(Long communityId, CommunityPostType type);
  boolean isLiked(Long communityId, CommunityPostType type, String userSignId);
  void deleteLikes(Long communityId, CommunityPostType type);

}
