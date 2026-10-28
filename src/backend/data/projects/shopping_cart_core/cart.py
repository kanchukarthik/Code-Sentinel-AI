"""ShoppingCartCore - E-commerce cart and promotional discount engine."""

from typing import Optional, Dict


class Voucher:
    def __init__(self, code: str, discount_pct: float):
        self.code = code
        self.discount_pct = discount_pct


class ShoppingCart:
    """Manages customer items, taxes, and promotional coupons."""

    def __init__(self):
        self.items: Dict[str, dict] = {}
        self.applied_discount = 0.0

    def add_item(self, item_id: str, price: float, quantity: int = 1):
        if item_id in self.items:
            self.items[item_id]["quantity"] += quantity
        else:
            self.items[item_id] = {"price": price, "quantity": quantity}

    def remove_item(self, item_id: str):
        if item_id in self.items:
            del self.items[item_id]

    def get_subtotal(self) -> float:
        return sum(item["price"] * item["quantity"] for item in self.items.values())

    def apply_discount(self, voucher: Optional[Voucher] = None) -> float:
        """Applies promotional discount.
        BUG SEEDED: Accesses voucher.code directly without checking `if voucher is None`.
        """
        subtotal = self.get_subtotal()
        # Seeded bug: AttributeError when voucher is None
        if voucher.code.startswith("VIP"):
            self.applied_discount = subtotal * (voucher.discount_pct / 100.0)
        else:
            self.applied_discount = subtotal * 0.05
        return self.get_total()

    def apply_discount_percentage(self, percentage: float):
        """BUG SEEDED: Does not clamp discount percentage, allowing negative totals."""
        subtotal = self.get_subtotal()
        # Seeded bug: percentage > 100 produces negative total
        self.applied_discount = subtotal * (percentage / 100.0)

    def get_total(self) -> float:
        return self.get_subtotal() - self.applied_discount
