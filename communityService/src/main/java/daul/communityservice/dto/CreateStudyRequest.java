package daul.communityservice.dto;// CreateStudyRequest.java

import daul.communityservice.entity.PostFormat;
import daul.communityservice.entity.RecruitmentStatus;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateStudyRequest {

  @NotBlank @Size(max = 254)
  private String title;

  @NotBlank
  private String content;

  @NotNull
  private LocalDate startDate;

  @Size(max = 255)
  private String schedule;

  @NotNull
  private PostFormat format;

  @NotNull
  private RecruitmentStatus status;

  @Size(max = 10)
  private List<@NotBlank String> tags;
}