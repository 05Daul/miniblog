package daul.communityservice.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "study_entity")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StudyEntity extends BaseCommunityEntity {
  @Column(name = "start_date", nullable = false)
  private LocalDate startDate;

  @Column(nullable = true, length = 255)
  private String schedule; // 진행 요일/시간 (String으로 유연하게 처리)

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private PostFormat format; // 진행 방식

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private RecruitmentStatus status; // 모집 상태

}
