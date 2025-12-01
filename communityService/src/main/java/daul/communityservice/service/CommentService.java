package daul.communityservice.service;

import daul.communityservice.dto.CommentResponse;
import daul.communityservice.dto.CreateCommentRequest;
import daul.communityservice.dto.UpdateCommentRequest;
import daul.communityservice.entity.tag.CommunityPostType;
import java.util.List;

public interface CommentService {

  Long createComment(Long communityId, CommunityPostType type, CreateCommentRequest request,
      String userId);

  Long getCommentCount(Long communityId, CommunityPostType type);

  List<CommentResponse> getComments(Long communityId, CommunityPostType type);

  List<CommentResponse> getReplies(Long parentCommentId);

  void updateComment(Long communityId, CommunityPostType type, Long commentId,
      UpdateCommentRequest request, String userId);

  void deleteComment(Long communityId, CommunityPostType type, Long commentId,
      String userId);

}
