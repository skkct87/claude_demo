package com.shopwave.orders.pricing;

import com.shopwave.orders.model.Customer;
import com.shopwave.orders.model.CustomerType;
import com.shopwave.orders.model.LoyaltyTier;
import org.springframework.stereotype.Component;

/**
 * Resolves the applicable pricing rule for a given customer.
 * B2B customers use volume-based rules; B2C customers use loyalty tier rules.
 */
@Component
public class PricingRuleEngine {

    private final PricingConfig config;

    public PricingRuleEngine(PricingConfig config) {
        this.config = config;
    }

    /**
     * Returns the applicable PricingRule for the customer, or null if none applies.
     */
    public PricingRule getRuleForCustomer(Customer customer) {
        if (customer == null) return null;

        if (customer.getType() == CustomerType.B2B) {
            return resolveB2BRule(customer);
        }

        return resolveLoyaltyRule(customer);
    }

    private PricingRule resolveB2BRule(Customer customer) {
        String partnerId = customer.getPartnerId();
        if (partnerId == null) return null;

        double partnerDiscount = config.getPartnerDiscount(partnerId);
        if (partnerDiscount <= 0) return null;

        return new FixedPercentPricingRule(partnerDiscount);
    }

    private PricingRule resolveLoyaltyRule(Customer customer) {
        LoyaltyTier tier = customer.getLoyaltyTier();
        if (tier == null) return null;

        return new FixedPercentPricingRule(tier.getDiscountPercent());
    }
}
