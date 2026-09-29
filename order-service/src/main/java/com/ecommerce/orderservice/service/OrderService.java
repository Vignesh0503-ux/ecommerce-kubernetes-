package com.ecommerce.orderservice.service;

import com.ecommerce.orderservice.client.ProductDto;
import com.ecommerce.orderservice.client.ProductServiceClient;
import com.ecommerce.orderservice.client.UserServiceClient;
import com.ecommerce.orderservice.entity.Order;
import com.ecommerce.orderservice.entity.OrderStatus;
import com.ecommerce.orderservice.exception.OrderValidationException;
import com.ecommerce.orderservice.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserServiceClient userServiceClient;
    private final ProductServiceClient productServiceClient;

    public OrderService(OrderRepository orderRepository,
                         UserServiceClient userServiceClient,
                         ProductServiceClient productServiceClient) {
        this.orderRepository = orderRepository;
        this.userServiceClient = userServiceClient;
        this.productServiceClient = productServiceClient;
    }

    /**
     * Creates an order after validating that:
     *  1. the user exists (calls User Service)
     *  2. the product exists (calls Product Service)
     *  3. the requested quantity is in stock
     * Total price is then calculated from the product's current price.
     */
    public Order createOrder(Order request) {
        userServiceClient.getUserById(request.getUserId())
                .orElseThrow(() -> new OrderValidationException(
                        "User with id " + request.getUserId() + " does not exist"));

        ProductDto product = productServiceClient.getProductById(request.getProductId())
                .orElseThrow(() -> new OrderValidationException(
                        "Product with id " + request.getProductId() + " does not exist"));

        if (product.getQuantity() == null || product.getQuantity() < request.getQuantity()) {
            throw new OrderValidationException(
                    "Insufficient stock for product " + request.getProductId()
                            + " (requested " + request.getQuantity() + ", available "
                            + (product.getQuantity() == null ? 0 : product.getQuantity()) + ")");
        }

        BigDecimal totalPrice = product.getPrice().multiply(BigDecimal.valueOf(request.getQuantity()));

        Order order = new Order();
        order.setUserId(request.getUserId());
        order.setProductId(request.getProductId());
        order.setQuantity(request.getQuantity());
        order.setTotalPrice(totalPrice);
        order.setStatus(OrderStatus.CREATED);

        return orderRepository.save(order);
    }

    public Order updateStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderValidationException("Order with id " + orderId + " does not exist"));
        order.setStatus(newStatus);
        return orderRepository.save(order);
    }
}
