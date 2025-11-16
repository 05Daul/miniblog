package daul.blogservice.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PostCreationRequestDTO {

  @NotBlank(message = "제목이 비어있습니다.")
  private String title;

  @NotBlank(message = "내용이 비어있습니다.")
  private String content;

  private String thumbnail;

  private Boolean isPublished = true;

  private List<String> tags;

}
