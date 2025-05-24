package com.taa.tshirtsatis.repository;

import com.taa.tshirtsatis.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {

    @Query("SELECT o FROM Order o WHERE o.user.id = :userId ORDER BY o.id DESC")
    List<Order> findByUserId(@Param("userId") int userId);
    
    List<Order> findByActiveTrue();
    
    Optional<Order> findByUser_IdAndActiveTrue(int userId);

    List<Order> findAllByUser_IdAndActiveTrue(int userId);
    
}
