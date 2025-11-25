package daul.communityservice.dao;

import daul.communityservice.entity.TagEntity;
import java.util.Optional;

public interface TagDao {
  Optional<TagEntity> findByTagName(String tagName);

  TagEntity save(TagEntity tag);

}
