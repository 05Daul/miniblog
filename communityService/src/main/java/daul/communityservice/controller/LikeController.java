package daul.communityservice.controller;

import daul.communityservice.entity.tag.CommunityPostType;
import daul.communityservice.service.LikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/community")
@RequiredArgsConstructor
public class LikeController {

  private final LikeService likeService;

  /**
   * 좋아요 토글 (생성/취소)
   * POST /community/likes/{type}/{communityId}
   */
  @PostMapping("/likes/{type}/{communityId}")
  public ResponseEntity<Boolean> toggleLike(
      @PathVariable CommunityPostType type,
      @PathVariable Long communityId,
      @RequestHeader("userSignId") String userId) {

    boolean isLiked = likeService.toggleLike(communityId, type, userId);
    return ResponseEntity.ok(isLiked);
  }

  /**
   * 좋아요 수 조회
   * GET /community/likes/{type}/{communityId}/count
   */
  @GetMapping("/likes/{type}/{communityId}/count")
  public ResponseEntity<Long> getLikeCount(
      @PathVariable CommunityPostType type,
      @PathVariable Long communityId) {

    Long count = likeService.getLikeCount(communityId, type);
    return ResponseEntity.ok(count);
  }

  /**
   * 사용자의 좋아요 여부 확인
   * GET /community/likes/{type}/{communityId}/check
   */
  @GetMapping("/likes/{type}/{communityId}/check")
  public ResponseEntity<Boolean> checkLike(
      @PathVariable CommunityPostType type,
      @PathVariable Long communityId,
      @RequestHeader("userSignId") String userId) {

    boolean isLiked = likeService.isLiked(communityId, type, userId);
    return ResponseEntity.ok(isLiked);
  }
}