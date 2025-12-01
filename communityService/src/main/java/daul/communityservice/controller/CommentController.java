package daul.communityservice.controller;

import daul.communityservice.dto.CommentResponse;
import daul.communityservice.dto.CreateCommentRequest;
import daul.communityservice.dto.UpdateCommentRequest;
import daul.communityservice.entity.tag.CommunityPostType;
import daul.communityservice.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/community")
@RequiredArgsConstructor
public class CommentController {

  private final CommentService commentService;

  /**
   * 댓글 작성 POST /api/comments/{type}/{communityId}
   */
  @PostMapping("/comments/{type}/{communityId}")
  public ResponseEntity<Long> createComment(
      @PathVariable CommunityPostType type,
      @PathVariable Long communityId,
      @Valid @RequestBody CreateCommentRequest request,
      @RequestHeader("userSignId") String userId) {

    Long commentId = commentService.createComment(communityId, type, request, userId);
    return ResponseEntity.status(HttpStatus.CREATED).body(commentId);
  }

  /**
   * 특정 게시글의 모든 댓글 조회 (계층 구조) GET /api/comments/{type}/{communityId}
   */
  @GetMapping("/comments/{type}/{communityId}")
  public ResponseEntity<List<CommentResponse>> getComments(
      @PathVariable CommunityPostType type,
      @PathVariable Long communityId) {

    List<CommentResponse> comments = commentService.getComments(communityId, type);
    return ResponseEntity.ok(comments);
  }

  /**
   * 특정 댓글의 대댓글만 조회 GET /api/comments/{commentId}/replies
   */
  @GetMapping("/comments/{commentId}/replies")
  public ResponseEntity<List<CommentResponse>> getReplies(
      @PathVariable Long commentId) {

    List<CommentResponse> replies = commentService.getReplies(commentId);
    return ResponseEntity.ok(replies);
  }

  /**
   * 댓글 수 조회 GET /api/comments/{type}/{communityId}/count
   */
  @GetMapping("/comments/{type}/{communityId}/count")
  public ResponseEntity<Long> getCommentCount(
      @PathVariable CommunityPostType type,
      @PathVariable Long communityId) {

    Long count = commentService.getCommentCount(communityId, type);
    return ResponseEntity.ok(count);
  }

  @PutMapping("/{type}/{communityId}/comments/{commentId}")
  public ResponseEntity<Void> updateComment(
      @PathVariable CommunityPostType type,
      @PathVariable Long communityId,
      @PathVariable Long commentId,
      @Valid @RequestBody UpdateCommentRequest request,
      @RequestHeader("userSignId") String userId) {

    commentService.updateComment(communityId, type, commentId, request, userId);
    return ResponseEntity.noContent().build(); // 204 No Content
  }

  @DeleteMapping("/{type}/{communityId}/comments/{commentId}")
  public ResponseEntity<Void> deleteComment(
      @PathVariable CommunityPostType type,
      @PathVariable Long communityId,
      @PathVariable Long commentId,
      @RequestHeader("userSignId") String userId) {

    commentService.deleteComment(communityId, type, commentId, userId);
    return ResponseEntity.noContent().build(); // 204 No Content
  }
}