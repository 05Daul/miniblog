package daul.userservice.dto;

import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsersDTO {
    @NotBlank(message = "아이디가 입력되지 않았습니다.")
    @Size(min = 4, message = "아이디는 최소 4자 이상이어야 합니다.")
    private String userSignId;

    @Email
    @NotBlank(message = "에메일 주소가 입력되지 않았습니다.")
    private String email;

    @NotBlank(message = "이름이 입력되지 않았습니다.")
    private String userName;

    @NotBlank(message = "사용하실 닉네임이 입력되지 않았습니다.")
    private String nickName;

    @NotBlank(message = "비밀번호가 입력되지 않았습니다.")
    @Size(min = 8, message = "비밀번호는 최소 8자 이상이어야 합니다.")
    @Pattern(
        regexp = "^(?=.*[!@#$%^&*(),.?\":{}|<>]).+$",
        message = "비밀번호에는 최소 하나의 특수문자가 포함되어야 합니다."
    )
    private String password;

    private String profile_img;
}
