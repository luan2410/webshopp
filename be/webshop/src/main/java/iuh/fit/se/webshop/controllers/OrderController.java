package iuh.fit.se.webshop.controllers;

import iuh.fit.se.webshop.models.CartItem;
import iuh.fit.se.webshop.models.Order;
import iuh.fit.se.webshop.models.OrderItem;
import iuh.fit.se.webshop.models.User;
import iuh.fit.se.webshop.repositories.CartItemRepository;
import iuh.fit.se.webshop.repositories.OrderRepository;
import iuh.fit.se.webshop.repositories.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.transaction.Transactional;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.stream.Collectors;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@RequestMapping("/api/orders")
@Tag(name = "Orders", description = "Order management APIs")
public class OrderController {
    
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final CartItemRepository cartItemRepository;
    
    public OrderController(OrderRepository orderRepository, UserRepository userRepository, CartItemRepository cartItemRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.cartItemRepository = cartItemRepository;
    }
    
    @PostMapping
    @Transactional
    @Operation(summary = "Checkout (Create order from cart)", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<?> checkout(Authentication authentication, @RequestBody CreateOrderRequest request) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        User user = userRepository.findByUsername(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        
        List<CartItem> cartItems = cartItemRepository.findByUserId(user.getId());
        if (cartItems.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cart empty"));
        }
        
        Order order = new Order();
        order.setUser(user);
        order.setOrderDate(new Date());
        order.setStatus("Paid");
        order.setShippingAddress(request.shippingAddress);
        order.setCode(UUID.randomUUID().toString().substring(0, 6).toUpperCase());
        
        double total = 0;
        for (CartItem ci : cartItems) {
            OrderItem oi = new OrderItem(order, ci.getProduct(), ci.getQuantity(), ci.getProduct().getPrice());
            order.getItems().add(oi);
            total += ci.getProduct().getPrice() * ci.getQuantity();
        }
        order.setTotalAmount(total);
        
        Order savedOrder = orderRepository.save(order);
        
        // Clear cart
        cartItemRepository.deleteAll(cartItems);
        
        // Return simple response to avoid serialization issues
        Map<String, Object> response = new HashMap<>();
        response.put("id", savedOrder.getId());
        response.put("code", savedOrder.getCode());
        response.put("orderDate", savedOrder.getOrderDate());
        response.put("status", savedOrder.getStatus());
        response.put("totalAmount", savedOrder.getTotalAmount());
        response.put("shippingAddress", savedOrder.getShippingAddress());
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping
    @Operation(summary = "Get my orders (User) or All (Admin)", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<?> getOrders(
            Authentication authentication,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
            }
            User user = userRepository.findByUsername(authentication.getName()).orElse(null);
            if (user == null) {
                return ResponseEntity.status(401).build();
            }
            
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
            
            List<Order> orders;
            
            if (startDate != null && endDate != null) {
                Date start = sdf.parse(startDate);
                Date end = sdf.parse(endDate);
                // Set to end of day
                end = new Date(end.getTime() + 24 * 60 * 60 * 1000 - 1);
                
                if (isAdmin) {
                    orders = orderRepository.findByDateRange(start, end);
                } else {
                    orders = orderRepository.findByUserIdAndDateRange(user.getId(), start, end);
                }
            } else {
                // No date filter
                if (isAdmin) {
                    orders = orderRepository.findAll();
                } else {
                    orders = orderRepository.findByUserIdOrderByOrderDateDesc(user.getId());
                }
            }
            
            // Convert to DTOs to avoid serialization issues
            List<Map<String, Object>> orderDTOs = orders.stream().map(order -> {
                Map<String, Object> dto = new HashMap<>();
                dto.put("id", order.getId());
                dto.put("code", order.getCode());
                dto.put("orderDate", order.getOrderDate());
                dto.put("status", order.getStatus());
                dto.put("totalAmount", order.getTotalAmount());
                dto.put("shippingAddress", order.getShippingAddress());
                
                // Add items
                List<Map<String, Object>> itemDTOs = order.getItems().stream().map(item -> {
                    Map<String, Object> itemDTO = new HashMap<>();
                    itemDTO.put("id", item.getId());
                    itemDTO.put("quantity", item.getQuantity());
                    itemDTO.put("unitPrice", item.getUnitPrice());
                    
                    // Add product info
                    if (item.getProduct() != null) {
                        Map<String, Object> productDTO = new HashMap<>();
                        productDTO.put("id", item.getProduct().getId());
                        productDTO.put("name", item.getProduct().getName());
                        productDTO.put("price", item.getProduct().getPrice());
                        productDTO.put("image", item.getProduct().getImage());
                        itemDTO.put("product", productDTO);
                    }
                    
                    return itemDTO;
                }).collect(Collectors.toList());
                
                dto.put("items", itemDTOs);
                return dto;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(orderDTOs);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage(), "type", e.getClass().getSimpleName()));
        }
    }
    
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update order status (Admin)", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Order> updateStatus(@PathVariable Long id, @RequestBody UpdateStatusRequest request) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order == null) {
            return ResponseEntity.notFound().build();
        }
        
        order.setStatus(request.status);
        return ResponseEntity.ok(orderRepository.save(order));
    }
    
    public static class CreateOrderRequest {
        public String shippingAddress;
    }
    
    public static class UpdateStatusRequest {
        public String status;
    }
}
