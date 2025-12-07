package daul.communityservice.controller;

import daul.communityservice.dto.PostCreationRequestDTO;
import daul.communityservice.dto.PostResDTO;
import daul.communityservice.entity.PostEntity;
import daul.communityservice.service.PostService;
import jakarta.transaction.Transactional;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/blog")
@RequiredArgsConstructor
@Slf4j
public class BlogController {

  private final PostService postService;

  @PostMapping("/upload")
  public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
    if (file.isEmpty()) {
      return ResponseEntity.badRequest().body(Map.of("message", "파일이 존재하지 않습니다."));
    }

    try {
      String imageUrl = postService.uploadImage(file);

      Map<String, String> response = new HashMap<>();
      response.put("url", imageUrl);

      return ResponseEntity.ok(response);
    } catch (IOException e) {
      e.printStackTrace();
      return ResponseEntity.internalServerError().body(Map.of("message", "파일 업로드에 실패했습니다."));
    }
  }

  // 게시물 작성
  @PostMapping("/write")
  public ResponseEntity<PostEntity> writeFeed(
      @RequestHeader("userSignId") String authenticatedUserSignId,
      @RequestBody PostCreationRequestDTO postCreationRequestDTO) {
    PostEntity write = postService.writePost(authenticatedUserSignId, postCreationRequestDTO);
    return ResponseEntity.ok(write);
  }

  @PostMapping("/write/{postId}")
  public ResponseEntity<PostEntity> updateFeed(
      @RequestHeader("userSignId") String authenticatedUserSignId,
      @PathVariable Long postId,
      @RequestBody PostCreationRequestDTO postCreationRequestDTO
  ) {
    PostEntity updatedPost = postService.updatePost(authenticatedUserSignId, postId,
        postCreationRequestDTO);
    return ResponseEntity.ok(updatedPost);
  }

  // 게시물 삭제(완전)
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


  @GetMapping("/{postId}")
  public ResponseEntity<PostEntity> getPosts(@PathVariable Long postId) {
    PostEntity post = postService.readPost(postId);
    if (post != null) {
      return ResponseEntity.ok(post);
    } else {
      return ResponseEntity.notFound().build();
    }
  }

  // 태그 가져오기
  @GetMapping("/tags")
  public ResponseEntity<List<String>> getPostTags(@RequestParam Long postId) {
    try {
      List<String> tags = postService.getTagNamesByPostId(postId);
      return ResponseEntity.ok(tags);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(null);
    }
  }

  // 태그 단일 추가
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

  //여러 태그 추가
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

  // 태그 제거하기
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

  // 조회수
  @PostMapping("/view")
  public ResponseEntity<String> incrementViewCount(@RequestParam Long postId) {
    try {
      postService.incrementViewCount(postId);
      return ResponseEntity.ok().body("조회수가 증가되었습니다.");
    } catch (Exception e) {
      return ResponseEntity.badRequest().body("조회수 증가 실패: " + e.getMessage());
    }
  }

  @GetMapping("/recent")
  public ResponseEntity<Page<PostResDTO>> getRecentPosts(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size) {
    Pageable pageable = PageRequest.of(page, size);
    Page<PostEntity> postPage = postService.getRecentPosts(pageable);
    Page<PostResDTO> dtoPage = postPage.map(this::convertToResponseDTO);
    return ResponseEntity.ok(dtoPage);
  }


  @GetMapping("/trending")
  public ResponseEntity<Page<PostResDTO>> getTrendingPosts(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size) {

    Pageable pageable = PageRequest.of(page, size);
    Page<PostEntity> postPage = postService.getTrendingPosts(pageable);

    Page<PostResDTO> dtoPage = postPage.map(this::convertToResponseDTO);

    return ResponseEntity.ok(dtoPage);
  }

  @PostMapping("/feed")
  public ResponseEntity<Page<PostResDTO>> getFeedPosts(
      @RequestHeader("userSignId") String currentUserId,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size) {
    Pageable pageable = PageRequest.of(page, size);
    Page<PostEntity> postPage = postService.getFeedPosts(currentUserId, pageable);
    Page<PostResDTO> dtoPage = postPage.map(this::convertToResponseDTO);
    return ResponseEntity.ok(dtoPage);

  }

  // 💡 6. 게시글 삭제 (DELETE)
  @DeleteMapping("/{postId}")
  public ResponseEntity<Void> deletePost(@PathVariable Long postId) {
    postService.deletePost(postId);
    return ResponseEntity.noContent().build();
  }

  private PostResDTO convertToResponseDTO(PostEntity entity) {
    return PostResDTO.builder()
        .postId(entity.getPostId())
        .authorId(entity.getAuthorId())
        .title(entity.getTitle())
        .content(entity.getContent())
        .thumbnail(entity.getThumbnail())
        .isPublished(entity.getIsPublished())
        .viewCount(entity.getViewCount())
        .createdAt(entity.getCreatedAt())
        .updatedAt(entity.getUpdatedAt())
        .tags(List.of())
        .build();
  }
}
