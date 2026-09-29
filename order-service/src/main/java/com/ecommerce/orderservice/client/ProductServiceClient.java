package com.ecommerce.orderservice.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Optional;

/**
 * Talks to the Product Service over plain REST.
 * Base URL comes from the PRODUCT_SERVICE_URL environment variable / ConfigMap.
 */
@Component
public class ProductServiceClient {

    private final RestTemplate restTemplate;
    private final String productServiceUrl;

    public ProductServiceClient(RestTemplate restTemplate,
                                 @Value("${services.product-service.url}") String productServiceUrl) {
        this.restTemplate = restTemplate;
        this.productServiceUrl = productServiceUrl;
    }

    public Optional<ProductDto> getProductById(Long productId) {
        try {
            ProductDto product = restTemplate.getForObject(productServiceUrl + "/api/products/{id}", ProductDto.class, productId);
            return Optional.ofNullable(product);
        } catch (HttpClientErrorException.NotFound e) {
            return Optional.empty();
        } catch (RestClientException e) {
            throw new IllegalStateException("Unable to reach Product Service: " + e.getMessage(), e);
        }
    }
}
