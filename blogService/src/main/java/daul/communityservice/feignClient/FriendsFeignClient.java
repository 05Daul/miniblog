package daul.communityservice.feignClient;

import java.util.List;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader; // ✅ RequestHeader import

@FeignClient(name = "userService",
    url = "${user.service.url}"
  //  configuration = FeignClientConfig.class) // FeignClientConfig는 필요하면 유지
)
public interface FriendsFeignClient {

  @PostMapping("/friends/msa")
  List<String> getMSAFriendSignIds(
      @RequestHeader("Authorization") String authorizationHeader
  );
}