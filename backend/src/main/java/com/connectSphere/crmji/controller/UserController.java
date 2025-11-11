package com.ConnectSphere.crmji.controller;

import com.ConnectSphere.crmji.model.User;
import com.ConnectSphere.crmji.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    /**
     * GET /api/users
     * Fetches all users in the system (ADMIN and MANAGER can access)
     * @return List of all users without passwords
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            List<Map<String, Object>> userList = users.stream()
                    .map(user -> {
                        Map<String, Object> userMap = new HashMap<>();
                        userMap.put("id", user.getId());
                        userMap.put("firstName", user.getFirstName());
                        userMap.put("lastName", user.getLastName());
                        userMap.put("email", user.getEmail());
                        userMap.put("role", user.getRole());
                        userMap.put("enabled", user.getEnabled() != null ? user.getEnabled() : true);
                        userMap.put("createdAt", user.getCreatedAt());
                        userMap.put("updatedAt", user.getUpdatedAt());
                        return userMap;
                    })
                    .collect(Collectors.toList());
            // Always return 200 with list, even if empty
            return ResponseEntity.ok(userList);
        } catch (Exception e) {
            // Log error and return empty list
            System.err.println("Error fetching users: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(new java.util.ArrayList<>());
        }
    }

    /**
     * GET /api/users/{id}
     * Fetches a single user by ID (ADMIN and MANAGER can access)
     * @param id User ID
     * @return User details without password
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, Object>> getUserById(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        User user = userOpt.get();
        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", user.getId());
        userMap.put("firstName", user.getFirstName());
        userMap.put("lastName", user.getLastName());
        userMap.put("email", user.getEmail());
        userMap.put("role", user.getRole());
        userMap.put("enabled", user.getEnabled());
        userMap.put("createdAt", user.getCreatedAt());
        userMap.put("updatedAt", user.getUpdatedAt());
        
        return ResponseEntity.ok(userMap);
    }

    /**
     * PUT /api/users/{id}/role
     * Updates a user's role (ADMIN and MANAGER can update)
     * @param id User ID
     * @param request Role update request
     * @return Updated user details
     */
    @PutMapping("/{id}/role")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, Object>> updateUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        String newRole = request.get("role");
        if (newRole == null || newRole.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Role is required"));
        }

        // Validate role
        String roleUpper = newRole.toUpperCase();
        if (!roleUpper.equals("USER") && !roleUpper.equals("MANAGER") && !roleUpper.equals("ADMIN")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid role. Must be USER, MANAGER, or ADMIN"));
        }

        User user = userOpt.get();
        
        // Check if MANAGER is trying to assign ADMIN role (not allowed)
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isManager = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_MANAGER"));
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        
        if (isManager && !isAdmin && roleUpper.equals("ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Managers cannot assign ADMIN role"));
        }

        user.setRole(roleUpper);
        userRepository.save(user);

        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", user.getId());
        userMap.put("firstName", user.getFirstName());
        userMap.put("lastName", user.getLastName());
        userMap.put("email", user.getEmail());
        userMap.put("role", user.getRole());
        userMap.put("enabled", user.getEnabled());
        userMap.put("createdAt", user.getCreatedAt());
        userMap.put("updatedAt", user.getUpdatedAt());

        return ResponseEntity.ok(userMap);
    }

    /**
     * DELETE /api/users/{id}
     * Deletes a user by ID (ADMIN only)
     * @param id User ID
     * @return Success message
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        userRepository.deleteById(id);
        String timestamp = java.time.LocalDateTime.now().toString();
        return ResponseEntity.ok("User deleted at: " + timestamp);
    }
}

