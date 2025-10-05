package com.ConnectSphere.crmji.controller;

import com.ConnectSphere.crmji.model.Deal;
import com.ConnectSphere.crmji.service.DealService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

// DTO for creating a new Deal
record CreateDealRequest(
        String name,
        String description,
        BigDecimal value,
        String stage,
        Integer probability,
        java.time.LocalDate closeDate,
        Long contactId // ID of the associated contact
) {}

// DTO for updating an existing Deal
record UpdateDealRequest(
        String name,
        String description,
        BigDecimal value,
        String stage,
        Integer probability,
        java.time.LocalDate closeDate,
        Long contactId
) {}

@RestController
@RequestMapping("/api/deals")
public class DealController {

    @Autowired
    private DealService dealService;

    /**
     * GET /api/deals
     * Fetches all deals in the system.
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Object> getAllDeals() {
        List<Deal> deals = dealService.getAllDeals();
        if (deals.isEmpty()) {
            return new ResponseEntity<>("no data", HttpStatus.NOT_FOUND);
        } else {
            return new ResponseEntity<>(deals, HttpStatus.OK);
        }
    }

    /**
     * GET /api/deals/{id}
     * Fetches a single deal by its unique ID.
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Object> getDealById(@PathVariable Long id) {
        Optional<Deal> deal = dealService.getDealById(id);
        return deal.isPresent() ?
                new ResponseEntity<>(deal.get(), HttpStatus.OK) :
                new ResponseEntity<>("no data", HttpStatus.NOT_FOUND);
    }

    /**
     * GET /api/deals/contact/{contactId}
     * Fetches all deals associated with a specific contact.
     */
    @GetMapping("/contact/{contactId}")
    public ResponseEntity<Object> getDealsByContactId(@PathVariable Long contactId) {
        List<Deal> deals = dealService.getDealsByContactId(contactId);
        if (deals.isEmpty()) {
            return new ResponseEntity<>("no data", HttpStatus.NOT_FOUND);
        } else {
            return new ResponseEntity<>(deals, HttpStatus.OK);
        }
    }

    /**
     * GET /api/deals/stage/{stage}
     * Fetches all deals in a specific stage.
     */
    @GetMapping("/stage/{stage}")
    public ResponseEntity<Object> getDealsByStage(@PathVariable String stage) {
        List<Deal> deals = dealService.getDealsByStage(stage);
        if (deals.isEmpty()) {
            return new ResponseEntity<>("no data", HttpStatus.NOT_FOUND);
        } else {
            return new ResponseEntity<>(deals, HttpStatus.OK);
        }
    }

    /**
     * GET /api/deals/stats/pipeline-value
     * Gets the total value of all deals in the pipeline.
     */
    @GetMapping("/stats/pipeline-value")
    public ResponseEntity<BigDecimal> getTotalPipelineValue() {
        BigDecimal totalValue = dealService.getTotalPipelineValue();
        return new ResponseEntity<>(totalValue, HttpStatus.OK);
    }

    /**
     * GET /api/deals/closing-soon
     * Fetches deals closing within the next 30 days.
     */
    @GetMapping("/closing-soon")
    public ResponseEntity<Object> getDealsClosingSoon() {
        List<Deal> deals = dealService.getDealsClosingSoon();
        if (deals.isEmpty()) {
            return new ResponseEntity<>("no data", HttpStatus.NOT_FOUND);
        } else {
            return new ResponseEntity<>(deals, HttpStatus.OK);
        }
    }

    /**
     * POST /api/deals
     * Creates a new deal.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Object> createDeal(@RequestBody CreateDealRequest request) {
        try {
            Deal newDeal = new Deal();
            newDeal.setName(request.name());
            newDeal.setDescription(request.description());
            newDeal.setValue(request.value());
            newDeal.setStage(request.stage());
            newDeal.setProbability(request.probability());
            newDeal.setCloseDate(request.closeDate());

            // Create a minimal contact object with just the ID for the relationship
            com.ConnectSphere.crmji.model.Contact contact = new com.ConnectSphere.crmji.model.Contact();
            contact.setId(request.contactId());
            newDeal.setContact(contact);

            Deal savedDeal = dealService.createDeal(newDeal);
            return new ResponseEntity<>(savedDeal, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * PUT /api/deals/{id}
     * Updates an existing deal.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Object> updateDeal(@PathVariable Long id, @RequestBody UpdateDealRequest request) {
        try {
            Deal dealDetails = new Deal();
            dealDetails.setName(request.name());
            dealDetails.setDescription(request.description());
            dealDetails.setValue(request.value());
            dealDetails.setStage(request.stage());
            dealDetails.setProbability(request.probability());
            dealDetails.setCloseDate(request.closeDate());

            if (request.contactId() != null) {
                com.ConnectSphere.crmji.model.Contact contact = new com.ConnectSphere.crmji.model.Contact();
                contact.setId(request.contactId());
                dealDetails.setContact(contact);
            }

            Optional<Deal> updatedDeal = dealService.updateDeal(id, dealDetails);
            return updatedDeal.isPresent() ?
                    new ResponseEntity<>(updatedDeal.get(), HttpStatus.OK) :
                    new ResponseEntity<>("deal not found", HttpStatus.NOT_FOUND);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * DELETE /api/deals/{id}
     * Deletes a deal by its ID.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteDeal(@PathVariable Long id) {
        boolean wasDeleted = dealService.deleteDeal(id);
        if (wasDeleted) {
            String timestamp = java.time.LocalDateTime.now().toString();
            return new ResponseEntity<>("Deal deleted at: " + timestamp, HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Deal not found", HttpStatus.NOT_FOUND);
        }
    }
}