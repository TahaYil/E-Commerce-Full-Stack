package com.taa.tshirtsatis.entity;

import com.taa.tshirtsatis.enums.OrderedState;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.sql.Date;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "ordered")
public class Ordered {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @OneToMany(mappedBy = "ordered", fetch = FetchType.LAZY)
    private Set<Review> reviews;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "order_id")
    private Order order;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    private Date date;

    @Column(name = "state", columnDefinition = "VARCHAR(255) DEFAULT 'PENDING' CHECK (state IN ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'))")
    @Enumerated(EnumType.STRING)
    private OrderedState state = OrderedState.PENDING;
}
