package com.taa.tshirtsatis.repository;

import com.taa.tshirtsatis.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {

    // Rating'e göre tüm yorumları almak için
    @Query("SELECT r FROM Review r WHERE r.rating = :rating")
    public List<Review> getAllRating(@Param("rating") float rating);

    // Ürün ve Rating'e göre yorumları almak için
    @Query("SELECT r FROM Review r WHERE r.product.id = :productId AND r.rating = :rating")
    public List<Review> getAllProductAndRating(@Param("productId") int productId,
                                                @Param("rating") float rating);
    // eklenenler
    //!!!!!!!!!!!!!
    @Query("SELECT DISTINCT r FROM Review r " +
           "LEFT JOIN FETCH r.user u " +
           "LEFT JOIN FETCH r.product p " +
           "WHERE r.product.id = :productId " +
           "ORDER BY r.date DESC")
    public List<Review> getAllProductId(@Param("productId") int productId);

    @Query("SELECT r FROM Review r WHERE r.user.id = :userId ")
    public List<Review> getAllUserId(@Param("userId") int userId);

    @Query("SELECT COUNT(r) > 0 FROM Review r WHERE r.user.id = :userId AND r.product.id = :productId")
    public boolean existsByUserAndProduct(@Param("userId") int userId, @Param("productId") int productId);
}
