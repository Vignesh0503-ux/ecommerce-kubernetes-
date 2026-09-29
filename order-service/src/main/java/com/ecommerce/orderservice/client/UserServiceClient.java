package com.ecommerce.orderservice.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Optional;

/**
 * Talks to the User Service over plain REST.
 * Base URL comes from the USER_SERVICE_URL environment variable / ConfigMap
 * (e.g. http://user-service:8080 when running in Kubernetes, resolved via
 * Kubernetes DNS / the Service name).
 */
@Component
public class UserServiceClient {

    private final RestTemplate restTemplate;
    private final String userServiceUrl;

    public UserServiceClient(RestTemplate restTemplate,
                              @Value("${services.user-service.url}") String userServiceUrl) {
        this.restTemplate = restTemplate;
        this.userServiceUrl = userServiceUrl;
    }

    public Optional<UserDto> getUserById(Long userId) {
        try {
            UserDto user = restTemplate.getForObject(userServiceUrl + "/api/users/{id}", UserDto.class, userId);
            return Optional.ofNullable(user);
        } catch (HttpClientErrorException.NotFound e) {
            return Optional.empty();
        } catch (RestClientException e) {
            throw new IllegalStateException("Unable to reach User Service: " + e.getMessage(), e);
        }
    }
}
