package daul.communityservice.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyDetailInfo {
  private LocalDate startDate;
  private String schedule;
  private String format;
  private String status;
}