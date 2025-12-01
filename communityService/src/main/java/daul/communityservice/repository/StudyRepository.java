package daul.communityservice.repository;

import daul.communityservice.entity.project.ProjectEntity;
import daul.communityservice.entity.study.StudyEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudyRepository extends JpaRepository<StudyEntity, Long> {

}
