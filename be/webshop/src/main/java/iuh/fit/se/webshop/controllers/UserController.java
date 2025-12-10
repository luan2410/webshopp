package iuh.fit.se.webshop.controllers;

import iuh.fit.se.webshop.models.User;
import iuh.fit.se.webshop.repositories.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Users", description = "User management APIs")
public class UserController {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all users (Admin only)", security = @SecurityRequirement(name = "bearerAuth"))
    public List<User> getAll() {
        return userRepository.findAll();
    }
    
    @GetMapping("/profile")
    @Operation(summary = "Get current user profile", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<User> getProfile(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }
    
    @PutMapping("/profile")
    @Operation(summary = "Update current user profile", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<User> updateProfile(Authentication authentication, @RequestBody UpdateProfileRequest request) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        
        if (request.email != null) user.setEmail(request.email);
        if (request.fullName != null) user.setFullName(request.fullName);
        
        user = userRepository.save(user);
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }
    
    @PutMapping("/{id}/password")
    @Operation(summary = "Change password", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<?> changePassword(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody ChangePasswordRequest request) {
        
        User currentUser = userRepository.findByUsername(authentication.getName()).orElse(null);
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }
        
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isSelf = user.getId().equals(currentUser.getId());
        
        if (!isAdmin && !isSelf) {
            return ResponseEntity.status(403).build();
        }
        
        // Verify old password if self
        if (isSelf && !isAdmin) {
            if (request.oldPassword == null || !passwordEncoder.matches(request.oldPassword, user.getPassword())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Mật khẩu cũ không đúng"));
            }
        }
        
        user.setPassword(passwordEncoder.encode(request.newPassword));
        userRepository.save(user);
        
        return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công"));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user (Admin only)", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody AdminUpdateUserRequest request) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        
        if (request.email != null && !request.email.trim().isEmpty()) {
            user.setEmail(request.email);
        }
        if (request.fullName != null && !request.fullName.trim().isEmpty()) {
            user.setFullName(request.fullName);
        }
        if (request.role != null && (request.role.equals("USER") || request.role.equals("ADMIN"))) {
            user.setRole(request.role);
        }
        
        user = userRepository.save(user);
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete user (Admin only)", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
    
    public static class UpdateProfileRequest {
        public String email;
        public String fullName;
    }
    
    public static class ChangePasswordRequest {
        public String oldPassword;
        public String newPassword;
    }
    
    public static class AdminUpdateUserRequest {
        public String email;
        public String fullName;
        public String role;
    }
}
