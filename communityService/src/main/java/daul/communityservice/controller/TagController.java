package daul.communityservice.controller;

import daul.communityservice.service.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/community")
@RequiredArgsConstructor
public class TagController {

  private final TagService tagService;

  /**
   * 특정 게시글의 태그 조회
   * GET /api/tags/{communityId}
   */
  @GetMapping("tags/{communityId}")
  public ResponseEntity<List<String>> getTags(@PathVariable Long communityId) {
    List<String> tags = tagService.getTagNames(communityId);
    return ResponseEntity.ok(tags);
  }
}