package com.ConnectSphere.crmji.repository;

import com.ConnectSphere.crmji.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Finds a user by their email address.
     * This method is automatically implemented by Spring Data JPA based on method naming conventions.
     * @param email the email address to search for
     * @return an Optional containing the user if found, or empty if not found
     */
    Optional<User> findByEmail(String email);

    /**
     * Checks if a user exists with the given email address.
     * @param email the email address to check
     * @return true if a user with the email exists, false otherwise
     */
    Boolean existsByEmail(String email);
}