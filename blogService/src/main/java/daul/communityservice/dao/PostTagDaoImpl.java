package daul.communityservice.dao;


import daul.communityservice.entity.PostTagEntity;
import daul.communityservice.repository.PostTagRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
@RequiredArgsConstructor
public class PostTagDaoImpl implements PostTagDao {

  private final PostTagRepository postTagRepository;

  @Override
  public List<PostTagEntity> findByPostId(Long postId) {
    return postTagRepository.findByPostTagId_PostId(postId);
  }

  @Override
  public boolean existsByPostIdAndTagId(Long postId, Long tagId) {
    return postTagRepository.existsByPostTagId_PostIdAndPostTagId_TagId(postId, tagId);
  }

  @Override
  public void save(PostTagEntity postTag) {
    postTagRepository.save(postTag);
  }

  @Override
  @Transactional
  public void deleteByPostIdAndTagId(Long postId, Long tagId) {
    postTagRepository.deleteByPostTagId_PostIdAndPostTagId_TagId(postId, tagId);
  }

  @Override
  @Transactional
  public void deleteByPostId(Long postId) {
    postTagRepository.deleteByPostTagId_PostId(postId);
  }
}
