package iuh.fit.se.webshop.controllers;

import iuh.fit.se.webshop.models.Category;
import iuh.fit.se.webshop.repositories.CategoryRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@Tag(name = "Categories", description = "Category management APIs")
public class CategoryController {
    
    private final CategoryRepository categoryRepository;
    
    public CategoryController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }
    
    @GetMapping
    @Operation(summary = "Get all categories")
    public List<Category> getAll() {
        return categoryRepository.findAll();
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create new category (Admin only)", security = @SecurityRequirement(name = "bearerAuth"))
    public Category create(@RequestBody Category category) {
        return categoryRepository.save(category);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update category (Admin only)", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Category> update(@PathVariable Long id, @RequestBody Category category) {
        if (!categoryRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        category.setId(id);
        return ResponseEntity.ok(categoryRepository.save(category));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete category (Admin only)", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!categoryRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        categoryRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
