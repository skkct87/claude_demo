package com.shopwave.orders.pricing;

import com.shopwave.orders.model.Customer;
import com.shopwave.orders.model.CustomerType;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Calculates discount amounts for orders based on customer type,
 * loyalty tier, and applicable pricing rules.
 */
public class DiscountCalculator {

    private final PricingRuleEngine ruleEngine;

    public DiscountCalculator(PricingRuleEngine ruleEngine) {
        this.ruleEngine = ruleEngine;
    }

    /**
     * Returns the discounted total for the given customer and order amount.
     * If no discount applies, returns the original total unchanged.
     */
    public BigDecimal applyDiscount(Customer customer, BigDecimal orderTotal) {
        if (customer == null) {
            return orderTotal;
        }

        PricingRule rule = ruleEngine.getRuleForCustomer(customer);

        if (rule == null) {
            return orderTotal;
        }

        return rule.apply(orderTotal);
    }

    /**
     * Returns just the discount amount (not the discounted total).
     * Returns zero if no discount applies.
     */
    public BigDecimal calculateDiscountAmount(Customer customer, BigDecimal orderTotal) {
        BigDecimal discounted = applyDiscount(customer, orderTotal);
        return orderTotal.subtract(discounted).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Returns the applicable discount percentage for a customer, or 0 if none.
     */
    public double getDiscountPercent(Customer customer) {
        if (customer == null) return 0.0;

        PricingRule rule = ruleEngine.getRuleForCustomer(customer);
        if (rule == null) return 0.0;

        return rule.getDiscountPercent();
    }

    /**
     * Returns true if the customer is eligible for any discount.
     */
    public boolean isEligibleForDiscount(Customer customer) {
        return getDiscountPercent(customer) > 0;
    }
}
