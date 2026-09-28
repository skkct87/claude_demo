package com.shopwave.orders.service;

import com.shopwave.orders.model.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for OrderService.
 * Use this file as a style reference when generating tests for other classes.
 */
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private CustomerRepository customerRepository;

    @InjectMocks
    private OrderService orderService;

    private Customer testCustomer;

    @BeforeEach
    void setUp() {
        testCustomer = Customer.builder()
                .id("cust-001")
                .email("test@example.com")
                .firstName("Test")
                .type(CustomerType.B2C)
                .build();
    }

    @Test
    void getOrder_existingOrder_returnsOrder() {
        Order order = Order.builder().id("ord-001").customerId("cust-001").build();
        when(orderRepository.findById("ord-001")).thenReturn(Optional.of(order));

        Order result = orderService.getOrder("ord-001");

        assertEquals("ord-001", result.getId());
    }

    @Test
    void getOrder_nonExistentOrder_throwsException() {
        when(orderRepository.findById("ord-999")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> orderService.getOrder("ord-999"));
    }

    @Test
    void getOrdersForCustomer_returnsCustomerOrders() {
        when(customerRepository.findById("cust-001")).thenReturn(Optional.of(testCustomer));

        // Additional assertions...
    }
}
