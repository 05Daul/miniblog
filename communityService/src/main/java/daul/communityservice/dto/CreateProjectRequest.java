package daul.communityservice.dto;

import daul.communityservice.entity.PostFormat;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateProjectRequest {
  @NotBlank(message = "제목은 필수입니다.")
  @Size(max = 254, message = "제목은 254자 이하여야 합니다.")
  private String title;

  @NotBlank(message = "내용은 필수입니다.")
  private String content;

  @NotNull(message = "마감일은 필수입니다.")
  @FutureOrPresent(message = "마감일은 오늘 이후여야 합니다.")
  private LocalDateTime deadline;

  @NotNull(message = "진행 방식은 필수입니다.")
  private PostFormat format;

  @Min(value = 1, message = "모집 인원은 1명 이상이어야 합니다.")
  private Integer teamSize;

  @Size(max = 10, message = "태그는 최대 10개까지 가능합니다.")
  private List<@NotBlank String> tags;

}
