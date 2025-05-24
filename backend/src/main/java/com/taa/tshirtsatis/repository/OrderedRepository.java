package com.taa.tshirtsatis.repository;

import com.taa.tshirtsatis.entity.Ordered;
import com.taa.tshirtsatis.enums.OrderedState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.sql.Date;
import java.util.List;

public interface OrderedRepository extends JpaRepository<Ordered, Integer> {
    
    @Query("SELECT DISTINCT o FROM Ordered o " +
           "LEFT JOIN FETCH o.order ord " +
           "LEFT JOIN FETCH ord.orderItems oi " +
           "LEFT JOIN FETCH oi.product p " +
           "LEFT JOIN FETCH ord.products " +
           "LEFT JOIN FETCH p.categories " +
           "WHERE o.user.id = :userId " +
           "ORDER BY o.id DESC")
    List<Ordered> findByUserId(@Param("userId") int userId);

    // Siparişin durumuna göre listeleme
    List<Ordered> findByState(OrderedState state);
    
    // Siparişin durumuna göre sayma
    long countByState(OrderedState state);
    
    // Sipariş tarihine göre listeleme
    List<Ordered> findByDate(Date date);

    // Alternatif bir tarih sorgusu (gün, ay, yıl vb.)
    @Query("SELECT o FROM Ordered o WHERE o.date BETWEEN :startDate AND :endDate")
    List<Ordered> findByDateRange(@Param("startDate") Date startDate, @Param("endDate") Date endDate);
}
