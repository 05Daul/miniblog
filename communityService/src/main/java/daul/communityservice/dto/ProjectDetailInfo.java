package daul.communityservice.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDetailInfo {
  private LocalDateTime deadline;
  private String status;
  private String format;
  private Integer teamSize;
}