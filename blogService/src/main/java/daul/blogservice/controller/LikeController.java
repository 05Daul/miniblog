package daul.blogservice.controller;

import daul.blogservice.dto.LikeToggleResponseDTO;
import daul.blogservice.service.LikeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/blog/likes")
@RequiredArgsConstructor
@Slf4j
public class LikeController {

  private final LikeService likeService;
  @PostMapping("/{postId}")
  public ResponseEntity<LikeToggleResponseDTO> toggleLike(
      @PathVariable Long postId,
      @RequestHeader("userSignId") String authenticatedUserSignId // String 타입 그대로 사용
  ) {
    LikeToggleResponseDTO responseDTO = likeService.toggleLike(postId, authenticatedUserSignId);
    return ResponseEntity.ok(responseDTO);
  }
}
