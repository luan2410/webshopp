package iuh.fit.se.webshop.controllers;

import iuh.fit.se.webshop.models.CartItem;
import iuh.fit.se.webshop.models.Product;
import iuh.fit.se.webshop.models.User;
import iuh.fit.se.webshop.repositories.CartItemRepository;
import iuh.fit.se.webshop.repositories.ProductRepository;
import iuh.fit.se.webshop.repositories.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.transaction.Transactional;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@Tag(name = "Cart", description = "Shopping cart APIs")
public class CartController {
    
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    
    public CartController(CartItemRepository cartItemRepository, UserRepository userRepository, ProductRepository productRepository) {
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }
    
    @GetMapping
    @Operation(summary = "Get my cart", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<?> getCart(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        User user = userRepository.findByUsername(authentication.getName()).orElse(null);
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "User not found"));
        return ResponseEntity.ok(cartItemRepository.findByUserId(user.getId()));
    }
    
    @PostMapping
    @Transactional
    @Operation(summary = "Add to cart", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<?> addToCart(Authentication authentication, @RequestBody AddToCartRequest request) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        User user = userRepository.findByUsername(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        
        Product product = productRepository.findById(request.productId).orElse(null);
        if (product == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Product not found"));
        }
        
        CartItem existing = cartItemRepository.findByUserIdAndProductId(user.getId(), request.productId).orElse(null);
        
        if (existing != null) {
            existing.setQuantity(existing.getQuantity() + request.quantity);
            cartItemRepository.save(existing);
        } else {
            CartItem newItem = new CartItem(user, product, request.quantity);
            cartItemRepository.save(newItem);
        }
        
        return ResponseEntity.ok(Map.of("result", "ok"));
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update cart item quantity", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<?> updateQuantity(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody UpdateQuantityRequest request) {
        
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        User user = userRepository.findByUsername(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        
        CartItem item = cartItemRepository.findById(id).orElse(null);
        if (item == null || !item.getUser().getId().equals(user.getId())) {
            return ResponseEntity.notFound().build();
        }
        
        if (request.quantity <= 0) {
            cartItemRepository.delete(item);
        } else {
            item.setQuantity(request.quantity);
            cartItemRepository.save(item);
        }
        
        return ResponseEntity.ok(Map.of("result", "ok"));
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Remove cart item", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<?> remove(Authentication authentication, @PathVariable Long id) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        User user = userRepository.findByUsername(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        
        CartItem item = cartItemRepository.findById(id).orElse(null);
        if (item != null && item.getUser().getId().equals(user.getId())) {
            cartItemRepository.delete(item);
        }
        
        return ResponseEntity.ok(Map.of("result", "ok"));
    }
    
    public static class AddToCartRequest {
        public Long productId;
        public Integer quantity;
    }
    
    public static class UpdateQuantityRequest {
        public Integer quantity;
    }
}
