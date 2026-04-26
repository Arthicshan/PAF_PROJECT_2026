package com.sliit.smartcampus.config;

import com.mongodb.MongoClientSettings;
import org.bson.UuidRepresentation;
import org.springframework.boot.mongodb.autoconfigure.MongoClientSettingsBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@Configuration
@EnableMongoRepositories(basePackages = "com.sliit.smartcampus")
public class MongoConfig {

    @Bean
    public MongoClientSettingsBuilderCustomizer uuidRepresentationCustomizer() {
        return (MongoClientSettings.Builder builder) ->
                builder.uuidRepresentation(UuidRepresentation.STANDARD);
    }
}
