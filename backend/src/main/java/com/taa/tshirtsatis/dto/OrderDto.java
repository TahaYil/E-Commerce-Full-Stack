package com.taa.tshirtsatis.dto;

import com.taa.tshirtsatis.entity.Order;
import com.taa.tshirtsatis.entity.OrderItem;
import com.taa.tshirtsatis.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDto {

    private int id;

    @NotBlank(message = "Adres boş olamaz.")
    @Size(max = 255, message = "Adres en fazla 255 karakter olabilir.")
    private String address;

    @DecimalMin(value = "0.0", inclusive = false, message = "Toplam fiyat 0'dan büyük olmalıdır.")
    private float totalPrice;

    @Positive(message = "Kullanıcı ID pozitif bir değer olmalıdır.")
    private int userId;

    @NotEmpty(message = "Siparişte en az bir ürün olmalıdır.")
    private Set<@Positive(message = "Ürün ID geçerli olmalıdır.") Integer> productIds;

    private Boolean active;

    private List<OrderItemDto> orderItems;

    public OrderDto(Order order) {
        this.id = order.getId();
        this.address = order.getAddress();
        this.totalPrice = order.getTotalPrice();
        this.userId = order.getUser().getId();
        this.productIds = order.getProducts().stream()
                .map(Product::getId)
                .collect(Collectors.toSet());
        this.active = order.getActive();
        
        // Ürün detaylarını al
        if (order.getOrderItems() != null) {
            this.orderItems = order.getOrderItems().stream()
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
    }
}
