package daul.blogservice.repository;

import daul.blogservice.entity.TagEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TagRepository extends JpaRepository<TagEntity, Long> {
  Optional<TagEntity> findByTagName(String tagName);

  TagEntity save(TagEntity post);

}
