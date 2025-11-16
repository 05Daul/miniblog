package daul.blogservice.controller;


import daul.blogservice.dto.PostCreationRequestDTO;
import daul.blogservice.service.PostService;
import jakarta.transaction.Transactional;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/blog")
@RequiredArgsConstructor
@Slf4j
public class BlogController {

  private final PostService postService;

  @PostMapping("/write")
  public ResponseEntity<String> writeFeed(
      @RequestHeader("userSignId") String authenticatedUserSignId,
      @RequestBody PostCreationRequestDTO postCreationRequestDTO) {
    postService.writePost(authenticatedUserSignId, postCreationRequestDTO);
    return ResponseEntity.ok().body("게시물이 등록됐습니다.");
  }

  //@GetMapping("")

  @Transactional
  @DeleteMapping("/delete/post")
  public ResponseEntity<String> deleteFeed(@RequestParam Long postId) {
    try {
      postService.deletePost(postId);
      return ResponseEntity.ok().body("게시물이 삭제되었습니다.");
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body("게시글이 존재하지 않습니다.");
    }
  }

  @GetMapping("/tags")
  public ResponseEntity<List<String>> getPostTags(@RequestParam Long postId) {
    try {
      List<String> tags = postService.getTagNamesByPostId(postId);
      return ResponseEntity.ok(tags);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(null);
    }
  }

  @PostMapping("/tag/add")
  public ResponseEntity<String> addTagToPost(
      @RequestParam Long postId,
      @RequestParam String tagName) {
    try {
      postService.addTagToPost(postId, tagName);
      return ResponseEntity.ok().body("태그가 추가되었습니다.");
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(e.getMessage());
    } catch (IllegalStateException e) {
      return ResponseEntity.badRequest().body(e.getMessage());
    }
  }

  @PostMapping("/tags/add")
  public ResponseEntity<String> addTagsToPost(
      @RequestParam Long postId,
      @RequestBody List<String> tagNames) {
    try {
      postService.addTagsToPost(postId, tagNames);
      return ResponseEntity.ok().body("태그들이 추가되었습니다.");
    } catch (Exception e) {
      return ResponseEntity.badRequest().body(e.getMessage());
    }
  }

  @DeleteMapping("/tag/remove")
  public ResponseEntity<String> removeTagFromPost(
      @RequestParam Long postId,
      @RequestParam String tagName) {
    try {
      postService.removeTagFromPost(postId, tagName);
      return ResponseEntity.ok().body("태그가 제거되었습니다.");
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(e.getMessage());
    }
  }

  @PostMapping("/view")
  public ResponseEntity<String> incrementViewCount(@RequestParam Long postId) {
    try {
      postService.incrementViewCount(postId);
      return ResponseEntity.ok().body("조회수가 증가되었습니다.");
    } catch (Exception e) {
      return ResponseEntity.badRequest().body("조회수 증가 실패: " + e.getMessage());
    }
  }
}
