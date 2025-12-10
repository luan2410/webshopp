package iuh.fit.se.webshop.repositories;

import iuh.fit.se.webshop.models.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.items i LEFT JOIN FETCH i.product WHERE o.user.id = :userId ORDER BY o.orderDate DESC")
    List<Order> findByUserIdOrderByOrderDateDesc(@Param("userId") Long userId);
    
    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.items i LEFT JOIN FETCH i.product WHERE o.orderDate >= :startDate AND o.orderDate <= :endDate ORDER BY o.orderDate DESC")
    List<Order> findByDateRange(@Param("startDate") Date startDate, @Param("endDate") Date endDate);
    
    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.items i LEFT JOIN FETCH i.product WHERE o.user.id = :userId AND o.orderDate >= :startDate AND o.orderDate <= :endDate ORDER BY o.orderDate DESC")
    List<Order> findByUserIdAndDateRange(@Param("userId") Long userId, @Param("startDate") Date startDate, @Param("endDate") Date endDate);
}
