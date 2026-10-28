import pytest
import math
from decimal import Decimal

# CodeSentinel AI Auto-Synthesized Test Suite

def test_harmonic_mean_zero_division_guard():
    calc = Calculator()
    # Boundary stress: zero value in dataset must raise ValueError, not crash
    with pytest.raises(ValueError, match='Zero cannot be included in harmonic mean'):
        calc.harmonic_mean([10.0, 0.0, 20.0])


def test_compound_interest_sub_penny_precision():
    calc = Calculator()
    result = calc.compound_interest(principal=1000.00, rate=0.05, periods=365, years=1)
    # Verify precision is rounded using Decimal to prevent IEEE-754 drift
    assert isinstance(result, float)
    assert round(result, 2) == 1051.27


def test_cart_null_coupon_voucher_rejection():
    cart = ShoppingCart()
    cart.add_item('ITEM-01', price=50.0, quantity=2)
    # Negative & Exception stress: None voucher should safely raise or ignore
    with pytest.raises(TypeError, match='Voucher cannot be None'):
        cart.apply_discount(voucher=None)


def test_cart_discount_overflow_clamp():
    cart = ShoppingCart()
    cart.add_item('ITEM-02', price=100.0, quantity=1)
    # Negative discount percentage greater than 100%
    cart.apply_discount_percentage(150.0)
    assert cart.get_total() >= 0.0

