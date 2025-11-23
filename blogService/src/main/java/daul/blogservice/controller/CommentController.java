package daul.blogservice.controller;

import daul.blogservice.dto.CommentCreationRequestDTO;
import daul.blogservice.dto.CommentDTO;
import daul.blogservice.dto.CommentUpdateRequestDTO;
import daul.blogservice.service.CommentService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/blog/comments")
@RequiredArgsConstructor
public class CommentController {
  private final CommentService commentService;

  // 댓글, 대댓글 작성
  @PostMapping
  public ResponseEntity<CommentDTO> createComment(
      @RequestHeader("userSignId") String userId,
      @RequestBody CommentCreationRequestDTO dto) {
    try {
      CommentDTO comment = commentService.createComment(userId, dto);
      return ResponseEntity.ok(comment);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().build();
    }
  }

  // 게시글의 댓글 목록 조회
  @GetMapping
  public ResponseEntity<List<CommentDTO>> getComments(@RequestParam Long postId) {
    List<CommentDTO> comments = commentService.getCommentsByPostId(postId);
    return ResponseEntity.ok(comments);
  }

  // 특정 댓글 조회
  @GetMapping("/{commentId}")
  public ResponseEntity<CommentDTO> getComment(@PathVariable Long commentId) {
    try {
      CommentDTO comment = commentService.getCommentById(commentId);
      return ResponseEntity.ok(comment);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.notFound().build();
    }
  }

  // 댓글 수정
  @PutMapping("/{commentId}")
  public ResponseEntity<CommentDTO> updateComment(
      @PathVariable Long commentId,
      @RequestHeader("userSignId") String userId,
      @RequestBody CommentUpdateRequestDTO dto) {
    try {
      CommentDTO comment = commentService.updateComment(commentId, userId, dto);
      return ResponseEntity.ok(comment);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.notFound().build();
    } catch (IllegalStateException e) {
      return ResponseEntity.status(403).build();
    }
  }

  // 댓글 삭제
  @DeleteMapping("/{commentId}")
  public ResponseEntity<String> deleteComment(
      @PathVariable Long commentId,
      @RequestHeader("userSignId") String userId) {
    try {
      commentService.deleteComment(commentId, userId);
      return ResponseEntity.ok("댓글이 삭제되었습니다.");
    } catch (IllegalArgumentException e) {
      return ResponseEntity.notFound().build();
    } catch (IllegalStateException e) {
      return ResponseEntity.status(403).body("권한이 없습니다.");
    }
  }
  // 게시글의 댓글 개수 조회
  @GetMapping("/count")
  public ResponseEntity<Long> getCommentCount(@RequestParam Long postId) {
    Long count = commentService.getCommentCount(postId);
    return ResponseEntity.ok(count);
  }

}
