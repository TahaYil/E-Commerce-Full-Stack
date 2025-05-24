package com.taa.tshirtsatis.dto;

import com.taa.tshirtsatis.entity.Ordered;
import com.taa.tshirtsatis.enums.OrderedState;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Date;
import java.util.Set;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;
import java.util.ArrayList;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderedDto {

    private int id;

    @NotNull(message = "Sipariş ID'si boş olamaz.")
    @Min(value = 1, message = "Sipariş ID'si 1'den küçük olamaz.")
    private int orderId;

    @NotNull(message = "Kullanıcı ID'si boş olamaz.")
    @Min(value = 1, message = "Kullanıcı ID'si 1'den küçük olamaz.")
    private int userId;

    @NotNull(message = "Tarih boş olamaz.")
    @PastOrPresent(message = "Tarih geçmiş veya bugün olmalıdır.")
    private Date date;

    @NotNull(message = "Durum boş olamaz.")
    private OrderedState state;

    private Set<ProductDto> products;
    private float totalPrice;
    private String address;
    private Set<ReviewDto> reviews;
    private List<OrderItemDto> orderItems;

    public OrderedDto(Ordered ordered) {
        this.id = ordered.getId();
        
        if (ordered.getOrder() != null) {
            this.orderId = ordered.getOrder().getId();
            this.totalPrice = ordered.getOrder().getTotalPrice();
            this.address = ordered.getOrder().getAddress();
            
            // Products'ı doldur
            this.products = ordered.getOrder().getProducts().stream()
                .map(ProductDto::new)
                .collect(java.util.stream.Collectors.toSet());
            
            // OrderItems'ı doldur
            if (ordered.getOrder().getOrderItems() != null) {
                this.orderItems = ordered.getOrder().getOrderItems().stream()
                    .map(item -> {
                        OrderItemDto dto = new OrderItemDto();
                        dto.setProductId(item.getProduct().getId());
                        dto.setProductName(item.getProduct().getName());
                        dto.setPrice(item.getPrice());
                        dto.setQuantity(item.getQuantity());
                        dto.setSize(item.getSize());
                        return dto;
                    })
                    .collect(Collectors.toList());
            }
        } else {
            this.products = new HashSet<>();
            this.orderItems = new ArrayList<>();
        }
        
        if (ordered.getUser() != null) {
            this.userId = ordered.getUser().getId();
        }
        
        this.date = ordered.getDate();
        this.state = ordered.getState();
        
        // Reviews'ı doldur
        if (ordered.getReviews() != null) {
            this.reviews = ordered.getReviews().stream()
                .map(ReviewDto::new)
                .collect(java.util.stream.Collectors.toSet());
        } else {
            this.reviews = new HashSet<>();
        }
    }
}
