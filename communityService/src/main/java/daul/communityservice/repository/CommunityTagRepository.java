package daul.communityservice.repository;

import daul.communityservice.entity.tag.CommunityPostTagEntity;
import daul.communityservice.entity.tag.CommunityTagEntity;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CommunityTagRepository extends JpaRepository<CommunityTagEntity, Long> {

  // 태그명으로 조회
  Optional<CommunityTagEntity> findByTagName(String tagName);

  // 태그명 존재 여부
  boolean existsByTagName(String tagName);

  // 태그명으로 검색
  List<CommunityTagEntity> findByTagNameContaining(String keyword);

  // 여러 태그 조회
  List<CommunityTagEntity> findByTagIdIn(List<Long> tagIds);

  // 모든 태그 이름순 정렬
  List<CommunityTagEntity> findAllByOrderByTagNameAsc();

}
