"""Baseline test suite for ShoppingCartCore."""

import pytest
from cart import ShoppingCart, Voucher


def test_cart_add_and_subtotal():
    cart = ShoppingCart()
    cart.add_item("ITEM-1", 20.0, 2)
    cart.add_item("ITEM-2", 15.0, 1)
    assert cart.get_subtotal() == 55.0


def test_cart_valid_voucher():
    cart = ShoppingCart()
    cart.add_item("ITEM-1", 100.0, 1)
    voucher = Voucher(code="VIP-50", discount_pct=50.0)
    assert cart.apply_discount(voucher) == 50.0
