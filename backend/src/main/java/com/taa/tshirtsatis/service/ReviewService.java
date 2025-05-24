package com.taa.tshirtsatis.service;

import com.taa.tshirtsatis.dto.ReviewDto;
import com.taa.tshirtsatis.entity.Review;
import com.taa.tshirtsatis.entity.Users;
import com.taa.tshirtsatis.entity.Product;
import com.taa.tshirtsatis.repository.ReviewRepository;
import com.taa.tshirtsatis.repository.UsersRepository;
import com.taa.tshirtsatis.enums.OrderedState;
import com.taa.tshirtsatis.exception.ProductNotFoundException;
import com.taa.tshirtsatis.exception.UserNotFoundException;
import com.taa.tshirtsatis.exception.ReviewNotFoundException;

import com.taa.tshirtsatis.repository.ProductRepository;
import com.taa.tshirtsatis.repository.OrderedRepository;
import com.taa.tshirtsatis.entity.Ordered;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final UsersRepository usersRepository;
    private final ProductRepository productRepository;
    private final OrderedRepository orderedRepository;

    public List<ReviewDto> getAllReviews() {
        List<Review> reviews = reviewRepository.findAll();
        return reviews.stream().map(ReviewDto::new).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ReviewDto getReviewById(int id) {
        return reviewRepository.findById(id)
                .map(ReviewDto::new)
                .orElseThrow(() -> new ReviewNotFoundException("Review not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<ReviewDto> getAllByProductId(int productId) {
        try {
            if (!productRepository.existsById(productId)) {
                throw new ProductNotFoundException("Product not found with id: " + productId);
            }

            List<Review> reviews = reviewRepository.getAllProductId(productId);
            System.out.println("Found " + reviews.size() + " reviews for product " + productId);

            return reviews.stream()
                    .map(review -> {
                        ReviewDto dto = new ReviewDto(review);
                        if (review.getUser() != null) {
                            dto.setUserEmail(review.getUser().getEmail());
                        }
                        return dto;
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error in getAllByProductId: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public List<ReviewDto> getAllByUserId(int userId) {
        if (!usersRepository.existsById(userId)) {
            throw new UserNotFoundException("User not found with id: " + userId);
        }
        return reviewRepository.getAllUserId(userId).stream()
                .map(ReviewDto::new)
                .collect(Collectors.toList());
    }

    public List<ReviewDto> getAllByProductIdandRating(int productId, float rating) {
        if (!productRepository.existsById(productId)) {
            throw new UserNotFoundException("User not found with id: " + productId);
        }
        return reviewRepository.getAllProductAndRating(productId, rating).stream()
                .map(ReviewDto::new)
                .collect(Collectors.toList());
    }

    public ReviewDto create(ReviewDto reviewDto) {
        Users user = usersRepository.findById(reviewDto.getUserId())
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + reviewDto.getUserId()));
        
        Product product = productRepository.findById(reviewDto.getProductId())
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + reviewDto.getProductId()));

        Review review = new Review();
        review.setComment(reviewDto.getComment());
        review.setRating(reviewDto.getRating());
        review.setUser(user);
        review.setProduct(product);
        review.setDate(Date.valueOf(LocalDate.now()));

        Review savedReview = reviewRepository.save(review);
        return new ReviewDto(savedReview);
    }

    public ReviewDto update(int id, ReviewDto reviewDto) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ReviewNotFoundException("Review not found with id: " + id));
        
        review.setComment(reviewDto.getComment());
        review.setRating(reviewDto.getRating());
        
        Review updatedReview = reviewRepository.save(review);
        return new ReviewDto(updatedReview);
    }

    public void delete(int id) {
        if (!reviewRepository.existsById(id)) {
            throw new ReviewNotFoundException("Review not found with id: " + id);
        }
        reviewRepository.deleteById(id);
    }

    public ReviewDto createReviewForDeliveredOrder(ReviewDto reviewDto, int orderedId) {
        try {
            // Siparişi kontrol et
            Ordered ordered = orderedRepository.findById(orderedId)
                    .orElseThrow(() -> new ReviewNotFoundException("Sipariş bulunamadı: " + orderedId));

            // Sipariş durumunu kontrol et
            if (ordered.getState() != OrderedState.DELIVERED) {
                throw new IllegalStateException("Sadece teslim edilmiş siparişler için yorum yapılabilir.");
            }

            // Kullanıcının daha önce yorum yapıp yapmadığını kontrol et
            if (reviewRepository.existsByUserAndProduct(reviewDto.getUserId(), reviewDto.getProductId())) {
                throw new IllegalStateException("Bu ürüne daha önce yorum yapmışsınız.");
            }

            // Kullanıcıyı kontrol et
            Users user = usersRepository.findById(reviewDto.getUserId())
                    .orElseThrow(() -> new UserNotFoundException("Kullanıcı bulunamadı: " + reviewDto.getUserId()));

            // Ürünü kontrol et
            Product product = productRepository.findById(reviewDto.getProductId())
                    .orElseThrow(() -> new ProductNotFoundException("Ürün bulunamadı: " + reviewDto.getProductId()));

            // Yorumu oluştur
            Review review = new Review();
            review.setComment(reviewDto.getComment());
            review.setRating(reviewDto.getRating());
            review.setUser(user);
            review.setProduct(product);
            review.setOrdered(ordered);
            review.setDate(Date.valueOf(LocalDate.now()));

            System.out.println("Creating review: " + review);
            Review savedReview = reviewRepository.save(review);
            System.out.println("Saved review: " + savedReview);

            return new ReviewDto(savedReview);
        } catch (Exception e) {
            System.err.println("Error creating review: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public boolean checkIfUserCanReview(int userId, int productId, int orderedId) {
        try {
            // Siparişi kontrol et
            Ordered ordered = orderedRepository.findById(orderedId)
                    .orElseThrow(() -> new ReviewNotFoundException("Sipariş bulunamadı: " + orderedId));

            // Sipariş durumunu kontrol et
            if (ordered.getState() != OrderedState.DELIVERED) {
                return false;
            }

            // Kullanıcının daha önce yorum yapıp yapmadığını kontrol et
            return !reviewRepository.existsByUserAndProduct(userId, productId);
        } catch (Exception e) {
            throw new RuntimeException("Yorum yapma durumu kontrol edilirken bir hata oluştu: " + e.getMessage());
        }
    }
}
