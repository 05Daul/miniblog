package daul.communityservice.service;

import daul.communityservice.entity.tag.CommunityPostType;
import java.util.List;

public interface TagService {
  void updateTags(Long communityId, CommunityPostType type, List<String> tagNames);
  List<String> getTagNames(Long communityId);

}
