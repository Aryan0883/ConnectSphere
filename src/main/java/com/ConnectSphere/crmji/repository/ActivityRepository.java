package com.ConnectSphere.crmji.repository;

import com.ConnectSphere.crmji.model.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {

    // Find activities by contact
    List<Activity> findByContactId(Long contactId);

    // Find activities by deal
    List<Activity> findByDealId(Long dealId);

    // Find activities by type
    List<Activity> findByType(String type);

    // Find activities by completion status
    List<Activity> findByCompleted(Boolean completed);

    // Find overdue activities (due date passed but not completed)
    List<Activity> findByDueDateBeforeAndCompletedFalse(LocalDateTime date);

    // Find upcoming activities (due soon)
    List<Activity> findByDueDateBetween(LocalDateTime start, LocalDateTime end);

    // Find activities by contact and type
    List<Activity> findByContactIdAndType(Long contactId, String type);
}