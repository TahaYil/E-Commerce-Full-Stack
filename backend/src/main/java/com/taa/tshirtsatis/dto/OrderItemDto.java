package com.taa.tshirtsatis.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemDto {
    @NotNull(message = "Ürün ID'si boş olamaz.")
    @Positive(message = "Ürün ID pozitif bir değer olmalıdır.")
    private int productId;

    private String productName;

    @NotNull(message = "Miktar boş olamaz.")
    @Min(value = 1, message = "Miktar en az 1 olmalıdır.")
    private int quantity;

    @NotBlank(message = "Beden boş olamaz.")
    private String size;

    @NotNull(message = "Fiyat boş olamaz.")
    @DecimalMin(value = "0.0", inclusive = false, message = "Fiyat 0'dan büyük olmalıdır.")
    private float price;
} 