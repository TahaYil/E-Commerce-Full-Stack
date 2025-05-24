package com.taa.tshirtsatis.controller;

import com.taa.tshirtsatis.dto.OrderDto;
import com.taa.tshirtsatis.dto.OrderedDto;
import com.taa.tshirtsatis.entity.Users;
import com.taa.tshirtsatis.enums.OrderedState;
import com.taa.tshirtsatis.enums.Role;
import com.taa.tshirtsatis.service.OrderService;
import com.taa.tshirtsatis.service.OrderedService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.sql.Date;
import java.util.List;

@RestController
@RequestMapping("/order")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;
    private final OrderedService orderedService;

    // Sadece ADMIN tüm siparişleri görebilir
    @GetMapping("/all")
    public ResponseEntity<List<OrderDto>> getAllOrders(Authentication authentication) {
        Users currentUser = (Users) authentication.getPrincipal();

        if (currentUser.getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(orderService.getAllOrders());
    }

    // Sadece sahibi veya admin erişebilir
    @GetMapping("/{id}")
    public ResponseEntity<OrderDto> getOrderById(@PathVariable int id, Authentication authentication) {
        Users currentUser = (Users) authentication.getPrincipal();
        OrderDto order = orderService.getOrderById(id);

        if (order.getUserId() != currentUser.getId() && currentUser.getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(order);
    }

    // Kendi siparişlerini getirir
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderDto>> getOrdersByUserId(@PathVariable int userId, Authentication authentication) {
        Users currentUser = (Users) authentication.getPrincipal();

        if (currentUser.getId() != userId && currentUser.getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(orderService.getOrdersByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<OrderDto> createOrder(@RequestBody OrderDto orderDto, Authentication authentication) {
        Users currentUser = (Users) authentication.getPrincipal();
        orderDto.setUserId(currentUser.getId()); // Siparişi giriş yapan kullanıcıya ata
        
        OrderDto createdOrder = orderService.createOrder(orderDto);
        
        // Ordered oluştur
        OrderedDto orderedDto = new OrderedDto();
        orderedDto.setOrderId(createdOrder.getId());
        orderedDto.setUserId(currentUser.getId());
        orderedDto.setDate(new Date(System.currentTimeMillis()));
        orderedDto.setState(OrderedState.PENDING);
        
        orderedService.createOrdered(orderedDto);
        
        return ResponseEntity.ok(createdOrder);
    }

    // Sadece sahibi ya da admin güncelleyebilir
    @PutMapping("/{id}")
    public ResponseEntity<OrderDto> updateOrder(@PathVariable int id, @RequestBody OrderDto orderDto, Authentication authentication) {
        Users currentUser = (Users) authentication.getPrincipal();
        OrderDto existingOrder = orderService.getOrderById(id);

        if (existingOrder.getUserId() != (currentUser.getId()) && currentUser.getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(orderService.updateOrder(id, orderDto));
    }

    // Sadece sahibi ya da admin silebilir
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable int id, Authentication authentication) {
        Users currentUser = (Users) authentication.getPrincipal();
        OrderDto existingOrder = orderService.getOrderById(id);

        if (existingOrder.getUserId() != (currentUser.getId()) && currentUser.getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        orderService.deleteOrder(id);
        return ResponseEntity.ok().build();
    }

    // Yalnızca auth olan kullanıcıya kendi aktif siparişleri dönebilir
    @GetMapping("/active")
    public ResponseEntity<List<OrderDto>> getActiveOrders(Authentication authentication) {
        Users currentUser = (Users) authentication.getPrincipal();
        return ResponseEntity.ok(orderService.getOrdersByUserId(currentUser.getId()));
    }
}