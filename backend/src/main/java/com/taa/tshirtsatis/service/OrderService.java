package com.taa.tshirtsatis.service;

import com.taa.tshirtsatis.dto.OrderDto;
import com.taa.tshirtsatis.dto.OrderItemDto;
import com.taa.tshirtsatis.entity.Order;
import com.taa.tshirtsatis.entity.OrderItem;
import com.taa.tshirtsatis.entity.Product;
import com.taa.tshirtsatis.entity.ProductSize;
import com.taa.tshirtsatis.entity.Users;
import com.taa.tshirtsatis.exception.OrderNotFoundException;
import com.taa.tshirtsatis.exception.ProductNotFoundException;
import com.taa.tshirtsatis.exception.UserNotFoundException;
import com.taa.tshirtsatis.repository.OrderRepository;
import com.taa.tshirtsatis.repository.ProductRepository;
import com.taa.tshirtsatis.repository.ProductSizeRepository;
import com.taa.tshirtsatis.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UsersRepository usersRepository;
    private final ProductSizeRepository productSizeRepository;

    @Transactional(readOnly = true)
    public List<OrderDto> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(OrderDto::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderDto getOrderById(int id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException("Order not found with id: " + id));
        return new OrderDto(order);
    }

    public OrderDto createOrder(OrderDto orderDto) {
        Users user = usersRepository.findById(orderDto.getUserId())
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + orderDto.getUserId()));

        Order order = new Order();
        order.setUser(user);
        order.setAddress(orderDto.getAddress());
        order.setActive(true);

        // Stok kontrolü ve OrderItem oluşturma
        if (orderDto.getOrderItems() != null) {
            for (OrderItemDto itemDto : orderDto.getOrderItems()) {
                Product product = productRepository.findById(itemDto.getProductId())
                        .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + itemDto.getProductId()));
                
                ProductSize productSize = productSizeRepository.findByProductAndSize(product, itemDto.getSize())
                        .orElseThrow(() -> new IllegalArgumentException(
                            String.format("Ürün %s için %s bedeni bulunamadı", product.getName(), itemDto.getSize())
                        ));
                
                // Stok kontrolü
                if (productSize.getStock() < itemDto.getQuantity()) {
                    throw new IllegalStateException(
                        String.format("Ürün %s için %s bedeninde yeterli stok yok. Mevcut stok: %d, İstenen: %d",
                            product.getName(),
                            itemDto.getSize(),
                            productSize.getStock(),
                            itemDto.getQuantity()
                        )
                    );
                }
                
                // Stok güncelleme
                productSize.setStock(productSize.getStock() - itemDto.getQuantity());
                productSizeRepository.save(productSize);
                
                // Toplam stok miktarını güncelle
                product.updateTotalQuantity();
                productRepository.save(product);

                // OrderItem oluştur
                OrderItem orderItem = new OrderItem();
                orderItem.setOrder(order);
                orderItem.setProduct(product);
                orderItem.setQuantity(itemDto.getQuantity());
                orderItem.setSize(itemDto.getSize());
                orderItem.setPrice(itemDto.getPrice());
                order.getOrderItems().add(orderItem);
            }
        }

        // Toplam fiyatı hesapla
        order.setTotalPrice(calculateTotalPrice(orderDto));

        // Ürünleri ekle
        Set<Product> products = orderDto.getProductIds().stream()
                .map(productId -> productRepository.findById(productId)
                        .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + productId)))
                .collect(Collectors.toSet());
        order.setProducts(products);

        Order savedOrder = orderRepository.save(order);
        return new OrderDto(savedOrder);
    }

    public OrderDto updateOrder(int id, OrderDto orderDto) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException("Order not found with id: " + id));

        Users user = usersRepository.findById(orderDto.getUserId())
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + orderDto.getUserId()));

        Set<Product> products = orderDto.getProductIds().stream()
                .map(productId -> productRepository.findById(productId)
                        .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + productId)))
                .collect(Collectors.toSet());

        order.setUser(user);
        order.setProducts(products);
        order.setAddress(orderDto.getAddress());
        order.setTotalPrice(calculateTotalPrice(orderDto));
        order.setActive(orderDto.getActive());

        Order updatedOrder = orderRepository.save(order);
        return new OrderDto(updatedOrder);
    }

    public void deleteOrder(int id) {
        if (!orderRepository.existsById(id)) {
            throw new OrderNotFoundException("Order not found with id: " + id);
        }
        orderRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getOrdersByUserId(int userId) {
        try {
            List<Order> orders = orderRepository.findByUserId(userId);
            if (orders == null || orders.isEmpty()) {
                return List.of();
            }
            return orders.stream()
                    .map(OrderDto::new)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Siparişler getirilirken bir hata oluştu: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getActiveOrders() {
        return orderRepository.findByActiveTrue().stream()
                .map(OrderDto::new)
                .collect(Collectors.toList());
    }

    private float calculateTotalPrice(OrderDto orderDto) {
        if (orderDto.getOrderItems() != null && !orderDto.getOrderItems().isEmpty()) {
            return (float) orderDto.getOrderItems().stream()
                    .mapToDouble(item -> item.getPrice() * item.getQuantity())
                    .sum();
        }
        return (float) orderDto.getProductIds().stream()
                .mapToDouble(productId -> productRepository.findById(productId)
                        .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + productId))
                        .getPrice())
                .sum();
    }
} 