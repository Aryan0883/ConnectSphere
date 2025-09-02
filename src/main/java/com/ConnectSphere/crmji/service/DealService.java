package com.ConnectSphere.crmji.service;

import com.ConnectSphere.crmji.model.Deal;
import com.ConnectSphere.crmji.repository.DealRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service // Marks this class as a Service layer Spring bean
public class DealService {

    @Autowired
    private DealRepository dealRepository;

    @Autowired
    private ContactService contactService; // Needed to validate contact existence

    /**
     * Retrieves all deals from the database.
     * @return a List of all Deal entities.
     */
    public List<Deal> getAllDeals() {
        return dealRepository.findAll();
    }

    /**
     * Retrieves a specific deal by its unique ID.
     * @param id the ID of the deal to find.
     * @return an Optional containing the found Deal or an empty Optional if not found.
     */
    public Optional<Deal> getDealById(Long id) {
        return dealRepository.findById(id);
    }

    /**
     * Creates a new deal and saves it to the database.
     * Validates that the associated contact exists.
     * @param deal the Deal object to be created.
     * @return the saved Deal object.
     * @throws IllegalArgumentException if the associated contact doesn't exist.
     */
    public Deal createDeal(Deal deal) {
        // Validate that the contact exists
        if (deal.getContact() == null || deal.getContact().getId() == null) {
            throw new IllegalArgumentException("Deal must be associated with a valid contact");
        }

        if (!contactService.getContactById(deal.getContact().getId()).isPresent()) {
            throw new IllegalArgumentException("Contact with ID " + deal.getContact().getId() + " does not exist");
        }

        return dealRepository.save(deal);
    }

    /**
     * Updates an existing deal.
     * @param id the ID of the deal to update.
     * @param dealDetails the Deal object containing the updated data.
     * @return an Optional containing the updated Deal if found, or an empty Optional if not found.
     */
    public Optional<Deal> updateDeal(Long id, Deal dealDetails) {
        Optional<Deal> existingDealOptional = dealRepository.findById(id);

        if (existingDealOptional.isPresent()) {
            Deal existingDeal = existingDealOptional.get();

            // Update only the fields that are provided (not null)
            if (dealDetails.getName() != null) {
                existingDeal.setName(dealDetails.getName());
            }
            if (dealDetails.getDescription() != null) {
                existingDeal.setDescription(dealDetails.getDescription());
            }
            if (dealDetails.getValue() != null) {
                existingDeal.setValue(dealDetails.getValue());
            }
            if (dealDetails.getStage() != null) {
                existingDeal.setStage(dealDetails.getStage());
            }
            if (dealDetails.getProbability() != null) {
                existingDeal.setProbability(dealDetails.getProbability());
            }
            if (dealDetails.getCloseDate() != null) {
                existingDeal.setCloseDate(dealDetails.getCloseDate());
            }
            if (dealDetails.getContact() != null && dealDetails.getContact().getId() != null) {
                // Validate the new contact exists
                if (!contactService.getContactById(dealDetails.getContact().getId()).isPresent()) {
                    throw new IllegalArgumentException("Contact with ID " + dealDetails.getContact().getId() + " does not exist");
                }
                existingDeal.setContact(dealDetails.getContact());
            }

            Deal updatedDeal = dealRepository.save(existingDeal);
            return Optional.of(updatedDeal);
        } else {
            return Optional.empty();
        }
    }

    /**
     * Deletes a deal from the database.
     * @param id the ID of the deal to delete.
     * @return true if the deal was found and deleted, false otherwise.
     */
    public boolean deleteDeal(Long id) {
        if (dealRepository.existsById(id)) {
            dealRepository.deleteById(id);
            return true;
        } else {
            return false;
        }
    }

    /**
     * Finds all deals associated with a specific contact.
     * @param contactId the ID of the contact.
     * @return a list of deals for the given contact.
     */
    public List<Deal> getDealsByContactId(Long contactId) {
        return dealRepository.findByContactId(contactId);
    }

    /**
     * Finds all deals in a specific stage.
     * @param stage the stage to filter by.
     * @return a list of deals in the specified stage.
     */
    public List<Deal> getDealsByStage(String stage) {
        return dealRepository.findByStage(stage);
    }

    /**
     * Calculates the total value of all deals in the pipeline.
     * @return the total potential revenue from all deals.
     */
    public BigDecimal getTotalPipelineValue() {
        return getAllDeals().stream()
                .map(Deal::getValue)
                .filter(value -> value != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Finds deals closing soon (within the next 30 days).
     * @return a list of deals with close dates in the near future.
     */
    public List<Deal> getDealsClosingSoon() {
        LocalDate thirtyDaysFromNow = LocalDate.now().plusDays(30);
        return dealRepository.findByCloseDateLessThanEqual(thirtyDaysFromNow);
    }

    /**
     * Finds high-probability deals (75% or higher).
     * @return a list of deals likely to close.
     */
    public List<Deal> getHighProbabilityDeals() {
        return dealRepository.findByProbabilityGreaterThanEqual(75);
    }
}