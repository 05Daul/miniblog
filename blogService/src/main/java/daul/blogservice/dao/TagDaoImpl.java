package daul.blogservice.dao;

import daul.blogservice.entity.TagEntity;
import daul.blogservice.repository.TagRepository;
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
