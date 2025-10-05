package com.ConnectSphere.crmji.controller;

import com.ConnectSphere.crmji.model.Lead;
import com.ConnectSphere.crmji.service.LeadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

// Java 21 - Using Records for Data Transfer Objects (DTOs)
/**
 * DTO (Data Transfer Object) for creating a new Lead.
 * Used to decouple the API layer from the persistence layer.
 * @param firstName
 * @param lastName
 * @param email
 * @param phone
 * @param company
 * @param status
 */
record CreateLeadRequest(
        String firstName,
        String lastName,
        String email,
        String phone,
        String company,
        String status
) {}

/**
 * DTO for updating an existing Lead.
 * All fields are optional (can be null).
 * @param firstName
 * @param lastName
 * @param email
 * @param phone
 * @param company
 * @param status
 */
record UpdateLeadRequest(
        String firstName,
        String lastName,
        String email,
        String phone,
        String company,
        String status
) {}

/**
 * DTO for updating only the status of a Lead.
 * @param status The new status to set for the lead.
 */
record UpdateLeadStatusRequest(
        String status
) {}

@RestController // Marks this class as a Controller where every method returns a domain object instead of a view.
@RequestMapping("/api/leads") // Maps all HTTP requests starting with '/api/leads' to this controller.
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class LeadController {

    // Injects the Service layer bean
    @Autowired
    private LeadService leadService;

    /**
     * GET /api/leads
     * Fetches all leads in the system.
     * @return ResponseEntity with a list of all Leads and HTTP status 200 (OK),
     *         or status 404 (NOT FOUND) with "no data" message if no leads exist.
     */
    @GetMapping
    public ResponseEntity<Object> getAllLeads() {
        // Delegate the call to the Service layer
        List<Lead> leads = leadService.getAllLeads();

        // Check if the list is empty
        if (leads.isEmpty()) {
            // Return a message with a NOT_FOUND status
            return new ResponseEntity<>("no data", HttpStatus.NOT_FOUND);
        } else {
            // Wrap the list in a ResponseEntity with an OK status
            return new ResponseEntity<>(leads, HttpStatus.OK);
        }
    }

    /**
     * GET /api/leads/{id}
     * Fetches a single lead by its unique ID.
     * @param id The path variable representing the Lead's ID.
     * @return ResponseEntity with the found Lead and status 200 (OK),
     *         or status 404 (NOT FOUND) with "no data" message if the lead doesn't exist.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Object> getLeadById(@PathVariable Long id) {
        // Service returns an Optional to handle the "not found" case
        Optional<Lead> lead = leadService.getLeadById(id);

        // Use a conditional check to handle the two cases
        if (lead.isPresent()) {
            // If found, return the lead with an OK status
            return new ResponseEntity<>(lead.get(), HttpStatus.OK);
        } else {
            // If empty, return a "no data" message with a NOT_FOUND status
            return new ResponseEntity<>("no data", HttpStatus.NOT_FOUND);
        }
    }

    /**
     * GET /api/leads/email/{email}
     * Fetches a lead by email address.
     * @param email The email address to search for.
     * @return ResponseEntity with the found Lead and status 200 (OK),
     *         or status 404 (NOT FOUND) with "no data" message if the lead doesn't exist.
     */
    @GetMapping("/email/{email}")
    public ResponseEntity<Object> getLeadByEmail(@PathVariable String email) {
        Optional<Lead> lead = leadService.getLeadByEmail(email);

        if (lead.isPresent()) {
            return new ResponseEntity<>(lead.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>("no data", HttpStatus.NOT_FOUND);
        }
    }

    /**
     * POST /api/leads
     * Creates a new lead.
     * @param request The request body, automatically deserialized from JSON into a CreateLeadRequest record.
     * @return ResponseEntity with the newly created Lead and status 201 (CREATED).
     */
    @PostMapping
    public ResponseEntity<Lead> createLead(@RequestBody CreateLeadRequest request) {
        // Map the DTO (CreateLeadRequest) to the Entity (Lead)
        Lead newLead = new Lead();
        newLead.setFirstName(request.firstName());
        newLead.setLastName(request.lastName());
        newLead.setEmail(request.email());
        newLead.setPhone(request.phone());
        newLead.setCompany(request.company());
        newLead.setStatus(request.status()); // Set initial status (e.g., "NEW")
        // Timestamps (createdAt, updatedAt) are set automatically by the Entity's @PrePersist method

        // Delegate the save operation to the Service layer
        Lead savedLead = leadService.createLead(newLead);

        // Return the saved entity with a CREATED status
        return new ResponseEntity<>(savedLead, HttpStatus.CREATED);
    }

    /**
     * PUT /api/leads/{id}
     * Fully updates an existing lead. Updates only the fields provided in the request.
     * @param id The path variable representing the Lead's ID to update.
     * @param request The request body containing the new values for the lead.
     * @return ResponseEntity with the updated Lead and status 200 (OK),
     *         or status 404 (NOT FOUND) if the lead doesn't exist.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Lead> updateLead(@PathVariable Long id, @RequestBody UpdateLeadRequest request) {
        // Map the DTO to an Entity object to pass to the service
        Lead leadDetails = new Lead();
        leadDetails.setFirstName(request.firstName());
        leadDetails.setLastName(request.lastName());
        leadDetails.setEmail(request.email());
        leadDetails.setPhone(request.phone());
        leadDetails.setCompany(request.company());
        leadDetails.setStatus(request.status());

        // Delegate the update operation to the Service layer
        Optional<Lead> updatedLead = leadService.updateLead(id, leadDetails);

        // Handle the Optional response from the service
        return updatedLead.map(lead -> new ResponseEntity<>(lead, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * PATCH /api/leads/{id}/status
     * Updates only the status of an existing lead.
     * @param id The path variable representing the Lead's ID to update.
     * @param request The request body containing the new status.
     * @return ResponseEntity with the updated Lead and status 200 (OK),
     *         or status 404 (NOT FOUND) if the lead doesn't exist.
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<Lead> updateLeadStatus(@PathVariable Long id, @RequestBody UpdateLeadStatusRequest request) {
        Optional<Lead> updatedLead = leadService.updateLeadStatus(id, request.status());

        return updatedLead.map(lead -> new ResponseEntity<>(lead, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * DELETE /api/leads/{id}
     * Deletes a lead by its ID.
     * @param id The path variable representing the Lead's ID to delete.
     * @return ResponseEntity with success message and status 200 (OK) if deleted successfully,
     *         or status 404 (NOT FOUND) with "Lead not found" message if the lead doesn't exist.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteLead(@PathVariable Long id) {
        boolean wasDeleted = leadService.deleteLead(id);

        if (wasDeleted) {
            String timestamp = java.time.LocalDateTime.now().toString();
            String responseMessage = "Lead deleted at: " + timestamp;
            return new ResponseEntity<>(responseMessage, HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Lead not found", HttpStatus.NOT_FOUND);
        }
    }
}