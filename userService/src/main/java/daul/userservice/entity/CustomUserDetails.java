package daul.userservice.entity;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;


@RequiredArgsConstructor
public class CustomUserDetails   implements UserDetails{
  
  private final UsersEntity usersEntity;

  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    List<GrantedAuthority> authorities = Collections.singletonList(
        new SimpleGrantedAuthority("ROLE_" + usersEntity.getRoleName().toString())
    );
    return authorities;
  }

  @Override
  public String getPassword() {
    return usersEntity.getPassword();
  }

  @Override
  public String getUsername() {
    return usersEntity.getUserName();
  }

  public String getUserSignId(){
    return usersEntity.getUserSignId();
  }

  // 만료 여부
  @Override
  public boolean isAccountNonExpired() {
    return UserDetails.super.isAccountNonExpired();
  }


  //  잠김 여부
  @Override
  public boolean isAccountNonLocked() {
    return true;
  }

  //  만료 여부
  @Override
  public boolean isCredentialsNonExpired() {
    return  true;
  }

  @Override
  public boolean isEnabled() {
    return usersEntity.getStatus() == UserStatus.ACTIVE;
  }


}
