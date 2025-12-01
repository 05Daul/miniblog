// ProjectController.java
package daul.communityservice.controller;

import daul.communityservice.dto.CreateProjectRequest;
import daul.communityservice.dto.PostDetailResponse;
import daul.communityservice.dto.PostSummaryResponse;
import daul.communityservice.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/community")
@RequiredArgsConstructor
public class ProjectController {

  private final ProjectService projectService;

  @PostMapping("/projects")
  public ResponseEntity<Long> createProject(
      @Valid @RequestBody CreateProjectRequest request,
      @RequestHeader("userSignId") String userId) {
    Long communityId = projectService.createProject(request, userId);
    return ResponseEntity.status(HttpStatus.CREATED).body(communityId);
  }

  @GetMapping("/projects/{communityId}")
  public ResponseEntity<PostDetailResponse> getProjectDetail(
      @PathVariable Long communityId,
      @RequestHeader(value = "userSignId", required = false) String userId) {
    PostDetailResponse response = projectService.getProjectDetail(communityId, userId);
    return ResponseEntity.ok(response);
  }

  @GetMapping("/projects")
  public ResponseEntity<Page<PostSummaryResponse>> getProjectList(
      @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
    Page<PostSummaryResponse> projects = projectService.getProjectList(pageable);
    return ResponseEntity.ok(projects);
  }

  @DeleteMapping("/projects/{communityId}")
  public ResponseEntity<Void> deleteProject(
      @PathVariable Long communityId,
      @RequestHeader("userSignId") String userId) {
    projectService.deleteProject(communityId, userId);
    return ResponseEntity.noContent().build();
  }
}