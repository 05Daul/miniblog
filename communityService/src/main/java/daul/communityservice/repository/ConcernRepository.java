package daul.communityservice.repository;

import daul.communityservice.entity.concern.ConcernEntity;
import daul.communityservice.entity.project.ProjectEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConcernRepository extends JpaRepository<ConcernEntity, Long> {

}
