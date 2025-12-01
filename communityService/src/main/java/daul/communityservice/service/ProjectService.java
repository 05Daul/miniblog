package daul.communityservice.service;

import daul.communityservice.dto.CreateProjectRequest;
import daul.communityservice.dto.PostDetailResponse;
import daul.communityservice.dto.PostSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProjectService {
  Long createProject(CreateProjectRequest request, String authorId);
  PostDetailResponse getProjectDetail(Long communityId, String userId);
  Page<PostSummaryResponse> getProjectList(Pageable pageable);
  void deleteProject(Long communityId, String userId);
}
