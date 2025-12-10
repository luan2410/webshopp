package iuh.fit.se.webshop.controllers;

import iuh.fit.se.webshop.models.User;
import iuh.fit.se.webshop.repositories.UserRepository;
import iuh.fit.se.webshop.security.JwtService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Authentication APIs")
public class AuthController {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    
    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }
    
    @PostMapping("/register")
    @Operation(summary = "Register new user")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (userRepository.existsByUsername(request.username)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username already exists"));
        }
        
        User user = new User();
        user.setUsername(request.username);
        user.setPassword(passwordEncoder.encode(request.password));
        user.setEmail(request.email);
        user.setFullName(request.fullName);
        user.setRole("USER");
        
        user = userRepository.save(user);
        
        String token = jwtService.generateToken(user.getUsername(), user.getRole(), user.getId());
        
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("role", user.getRole());
        response.put("username", user.getUsername());
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/login")
    @Operation(summary = "Login user")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        User user = userRepository.findByUsername(request.username)
                .orElse(null);
        
        if (user == null || !passwordEncoder.matches(request.password, user.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid credentials"));
        }
        
        String token = jwtService.generateToken(user.getUsername(), user.getRole(), user.getId());
        
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("role", user.getRole());
        response.put("username", user.getUsername());
        
        return ResponseEntity.ok(response);
    }
    
    public static class RegisterRequest {
        public String username;
        public String password;
        public String email;
        public String fullName;
    }
    
    public static class LoginRequest {
        public String username;
        public String password;
    }
}
