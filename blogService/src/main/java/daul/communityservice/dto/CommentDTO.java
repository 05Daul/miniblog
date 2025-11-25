package daul.communityservice.dto;

import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class CommentDTO {


  private Long commentId;
  private Long postId;
  private String userId;
  private Long parentId;
  private String content;
  private Boolean isDeleted;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
  private List<CommentDTO> childComments;  // 대댓글 리스트
  private Integer childCount;
}

