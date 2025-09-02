package com.ConnectSphere.crmji.repository;

import com.ConnectSphere.crmji.model.Deal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository // Marks this interface as a Spring Data Repository bean
// JpaRepository<Deal, Long> provides CRUD methods for the Deal entity with a primary key of type Long.
public interface DealRepository extends JpaRepository<Deal, Long> {

    /**
     * Finds all deals associated with a specific contact.
     * @param contactId the ID of the contact
     * @return a list of deals for the given contact
     */
    List<Deal> findByContactId(Long contactId);

    /**
     * Finds all deals in a specific stage of the sales pipeline.
     * @param stage the stage to search for (e.g., "PROPOSAL", "NEGOTIATION")
     * @return a list of deals in the specified stage
     */
    List<Deal> findByStage(String stage);

    /**
     * Finds deals with a value greater than or equal to the specified amount.
     * @param value the minimum deal value
     * @return a list of high-value deals
     */
    List<Deal> findByValueGreaterThanEqual(BigDecimal value);

    /**
     * Finds deals that are expected to close before or on the specified date.
     * @param date the target close date
     * @return a list of deals closing by the specified date
     */
    List<Deal> findByCloseDateLessThanEqual(LocalDate date);

    /**
     * Finds deals with probability greater than or equal to the specified percentage.
     * @param probability the minimum probability percentage
     * @return a list of high-probability deals
     */
    List<Deal> findByProbabilityGreaterThanEqual(Integer probability);
}