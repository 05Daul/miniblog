package daul.communityservice.dto;
import jakarta.validation.constraints.*;
import lombok.*;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateConcernRequest {

  @NotBlank @Size(max = 254)
  private String title;

  @NotBlank
  private String content;

  @Size(max = 10)
  private List<@NotBlank String> tags;
}