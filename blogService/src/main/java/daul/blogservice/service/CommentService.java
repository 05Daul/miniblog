package daul.blogservice.service;

import daul.blogservice.dto.CommentCreationRequestDTO;
import daul.blogservice.dto.CommentDTO;
import daul.blogservice.dto.CommentUpdateRequestDTO;
import java.util.List;

public interface CommentService {
  CommentDTO createComment(String userId, CommentCreationRequestDTO dto);
  CommentDTO updateComment(Long commentId, String userId, CommentUpdateRequestDTO dto);
  void deleteComment(Long commentId, String userId);
  List<CommentDTO> getCommentsByPostId(Long postId);
  CommentDTO getCommentById(Long commentId);
  Long getCommentCount(Long postId);

}
