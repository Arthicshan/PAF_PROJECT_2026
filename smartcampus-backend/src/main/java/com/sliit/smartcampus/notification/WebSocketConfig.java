package com.sliit.smartcampus.notification;

import com.sliit.smartcampus.auth.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.UUID;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
@Slf4j
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtUtil jwtUtil;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // In-memory broker for personal queues
        registry.enableSimpleBroker("/queue", "/topic");
        // Prefix for messages FROM client TO server
        registry.setApplicationDestinationPrefixes("/app");
        // Used by convertAndSendToUser() — maps to /queue/notifications per user
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("http://localhost:3000", "http://localhost:5173")
                .withSockJS(); // SockJS fallback for browsers that don't support raw WebSocket
    }

    /**
     * Secure WebSocket — validate JWT on CONNECT frame.
     * Without this, anyone can subscribe to any user's notifications.
     */
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor =
                        MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

                if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String authHeader = accessor.getFirstNativeHeader("Authorization");
                    if (authHeader != null && authHeader.startsWith("Bearer ")) {
                        String token = authHeader.substring(7);
                        try {
                            UUID  userId = jwtUtil.extractUserId(token);
                            String role = jwtUtil.extractRole(token);

                            UsernamePasswordAuthenticationToken auth =
                                    new UsernamePasswordAuthenticationToken(userId, null, null);
                            accessor.setUser(auth);

                            log.debug("WebSocket connected: userId={}", userId);
                        } catch (Exception e) {
                            log.warn("WebSocket JWT invalid: {}", e.getMessage());
                            throw new RuntimeException("Invalid JWT — WebSocket connection rejected");
                        }
                    } else {
                        throw new RuntimeException("Missing Authorization header on WebSocket CONNECT");
                    }
                }
                return message;
            }
        });
    }
}
