package com.sliit.smartcampus.auth;

import com.sliit.smartcampus.user.Role;
import com.sliit.smartcampus.user.User;
import com.sliit.smartcampus.user.UserRepository;
import com.sliit.smartcampus.user.NotifPrefs;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Value("${app.admin.emails:}")
    private String adminEmails;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String picture = (String) attributes.get("picture");
        Role loginRole = resolveLoginRole(email);

        log.info("OAuth2 login attempt: email={}, name={}, role={}", email, name, loginRole);

        User user = userRepository.findByEmail(email)
                .map(existing -> {
                    log.info("User exists in DB: {}", email);
                    if (existing.getId() == null) {
                        existing.setId(UUID.randomUUID());
                    }
                    existing.setName(name);
                    existing.setPictureUrl(picture);
                    if (existing.getRole() == null || loginRole == Role.ADMIN) {
                        existing.setRole(loginRole);
                    }
                    if (existing.getProvider() == null || existing.getProvider().isBlank()) {
                        existing.setProvider("GOOGLE");
                    }
                    if (existing.getNotifPrefs() == null) {
                        existing.setNotifPrefs(new NotifPrefs());
                    }
                    User saved = userRepository.save(existing);
                    log.info("User updated and saved: {}", saved.getId());
                    return saved;
                })
                .orElseGet(() -> {
                    log.info("Creating new user: {}", email);
                    User newUser = User.builder()
                            .email(email)
                            .name(name)
                            .pictureUrl(picture)
                            .role(loginRole)
                            .provider("GOOGLE")
                            .build();
                    User saved = userRepository.save(newUser);
                    log.info("New user created and saved: {} with id: {}", email, saved.getId());
                    return saved;
                });

        return UserPrincipal.create(user, attributes);
    }

    private Role resolveLoginRole(String email) {
        if (email != null && adminEmails != null) {
            for (String adminEmail : adminEmails.split(",")) {
                if (email.equalsIgnoreCase(adminEmail.trim())) {
                    return Role.ADMIN;
                }
            }
        }
        return Role.USER;
    }
}
