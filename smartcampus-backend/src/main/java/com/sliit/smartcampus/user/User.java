package com.sliit.smartcampus.user;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.UUID;

@Document(collection = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @Builder.Default
    private UUID id = UUID.randomUUID();

    @Indexed(unique = true)
    private String email;

    private String name;

    private String pictureUrl;

    private String passwordHash;

    private Role role;

    private String provider;

    @Builder.Default
    private NotifPrefs notifPrefs = new NotifPrefs();

    @CreatedDate
    private LocalDateTime createdAt;
}
