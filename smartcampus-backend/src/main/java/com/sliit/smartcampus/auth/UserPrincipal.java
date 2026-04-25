package com.sliit.smartcampus.auth;

import com.sliit.smartcampus.user.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.*;

@Getter
@AllArgsConstructor
public class UserPrincipal implements UserDetails, OAuth2User {

    private UUID id;
    private String email;
    private String role;
    private Map<String, Object> attributes;

    public static UserPrincipal create(User user, Map<String, Object> attributes) {
        return new UserPrincipal(
                user.getId(),
                user.getEmail(),
                user.getRole().name(),
                attributes
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role));
    }

    @Override public String getPassword() { return null; }
    @Override public String getUsername() { return email; }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }
    @Override public String getName() { return email; }
}