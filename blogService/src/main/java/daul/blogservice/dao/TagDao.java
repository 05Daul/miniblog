package daul.blogservice.dao;

import daul.blogservice.entity.TagEntity;
import java.util.Optional;

public interface TagDao {
  Optional<TagEntity> findByTagName(String tagName);

  TagEntity save(TagEntity tag);

}
