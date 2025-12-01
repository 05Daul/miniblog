package daul.communityservice.service;

import daul.communityservice.entity.tag.CommunityPostTagEntity;
import daul.communityservice.entity.tag.CommunityPostTagId;
import daul.communityservice.entity.tag.CommunityPostType;
import daul.communityservice.entity.tag.CommunityTagEntity;
import daul.communityservice.repository.CommunityPostTagRepository;
import daul.communityservice.repository.CommunityTagRepository;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class TagServiceImpl implements TagService {
  private final CommunityTagRepository tagRepository;
  private final CommunityPostTagRepository postTagRepository;
  @Override
  public void updateTags(Long communityId, CommunityPostType type, List<String> tagNames) {
    // 1. 기존 태그 매핑 삭제 (Type까지 체크하여 안전하게 삭제)
    List<CommunityPostTagEntity> oldTags = postTagRepository.findByIdCommunityIdAndCommunityType(communityId, type);
    postTagRepository.deleteAll(oldTags);

    if (tagNames == null || tagNames.isEmpty()) {
      return;
    }

    // 2. 새로운 태그 연결
    for (String tagName : tagNames) {
      // 태그가 존재하면 조회, 없으면 생성
      CommunityTagEntity tag = tagRepository.findByTagName(tagName)
          .orElseGet(() -> tagRepository.save(CommunityTagEntity.of(tagName)));

      // 매핑 테이블에 저장
      CommunityPostTagEntity postTag = new CommunityPostTagEntity();
      postTag.setId(new CommunityPostTagId(communityId, tag.getTagId()));
      postTag.setCommunityType(type);

      postTagRepository.save(postTag);
    }
  }

  @Transactional(readOnly = true)
  public List<String> getTagNames(Long communityId) {
    List<Long> tagIds = postTagRepository.findByIdCommunityId(communityId).stream()
        .map(pt -> pt.getId().getTagId())
        .collect(Collectors.toList());

    if (tagIds.isEmpty()) {
      return List.of();
    }

    List<CommunityTagEntity> tags = tagRepository.findByTagIdIn(tagIds);

    // 3. 태그 이름 목록 반환
    return tags.stream()
        .map(CommunityTagEntity::getTagName)
        .collect(Collectors.toList());
  }
}
