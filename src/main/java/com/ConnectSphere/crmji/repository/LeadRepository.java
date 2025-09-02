package com.ConnectSphere.crmji.repository;

import com.ConnectSphere.crmji.model.Lead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository // Marks this interface as a Spring Data Repository bean
// JpaRepository<Lead, Long> provides CRUD methods for the Lead entity with a primary key of type Long.
public interface LeadRepository extends JpaRepository<Lead, Long> {

    // Spring Data JPA will automatically implement this method.
    // It translates to: "SELECT * FROM leads WHERE email = ?"
    // Returns the result wrapped in an Optional to handle null cases gracefully.
    Optional<Lead> findByEmail(String email);

    // You can add more custom query methods here as needed.
    // Example: Find all leads by status
    // List<Lead> findByStatus(String status);

    // Example: Find all leads by company name
    // List<Lead> findByCompany(String company);
}