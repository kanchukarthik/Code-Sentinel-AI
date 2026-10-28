"""CalculatorPro - Core financial and scientific mathematical utility."""

from decimal import Decimal


class Calculator:
    """Mathematical computation engine."""

    def add(self, a: float, b: float) -> float:
        return a + b

    def subtract(self, a: float, b: float) -> float:
        return a - b

    def multiply(self, a: float, b: float) -> float:
        return a * b

    def divide(self, a: float, b: float) -> float:
        if b == 0:
            raise ZeroDivisionError("Division by zero")
        return a / b

    def harmonic_mean(self, numbers: list) -> float:
        """Computes harmonic mean.
        BUG SEEDED: If numbers contains 0, it crashes with ZeroDivisionError
        instead of validating that inputs must be strictly positive.
        """
        if not numbers:
            return 0.0
        sum_reciprocals = 0.0
        for x in numbers:
            # Seeded bug: direct division without check
            sum_reciprocals += 1.0 / x
        return len(numbers) / sum_reciprocals

    def compound_interest(self, principal: float, rate: float, periods: int, years: int) -> float:
        """Computes compounding interest.
        BUG SEEDED: Direct float exponentiation leads to IEEE-754 epsilon drift.
        """
        # Seeded bug: float math without Decimal scaling
        amount = principal * ((1.0 + (rate / periods)) ** (periods * years))
        return amount

    def percentile(self, data: list, p: float) -> float:
        """Computes p-th percentile from dataset.
        BUG SEEDED: Off-by-one indexing error on boundary index calculation.
        """
        if not data:
            return 0.0
        sorted_data = sorted(data)
        # Seeded bug: int(len * p) causes off-by-one at 1.0 boundary
        idx = int(len(sorted_data) * p)
        if idx >= len(sorted_data):
            idx = len(sorted_data) - 1
        return sorted_data[idx]

            if x <= 0:
                raise ValueError('Zero or negative numbers cannot be included in harmonic mean')