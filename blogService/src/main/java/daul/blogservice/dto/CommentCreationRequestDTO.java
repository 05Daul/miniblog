package daul.blogservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentCreationRequestDTO {

  private Long postId;
  private Long parentId;
  private String content;

}
