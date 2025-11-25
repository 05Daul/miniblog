package daul.communityservice.dao;

import daul.communityservice.entity.TagEntity;
import daul.communityservice.repository.TagRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class TagDaoImpl implements TagDao {

  private final TagRepository tagRepository;

  @Override
  public Optional<TagEntity> findByTagName(String tagName) {
    return tagRepository.findByTagName(tagName);

  }

  @Override
  public TagEntity save(TagEntity tag) {
    return tagRepository.save(tag);
  }
}
