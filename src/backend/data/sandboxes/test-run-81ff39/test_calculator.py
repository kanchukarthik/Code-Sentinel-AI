"""Baseline test suite for CalculatorPro."""

import pytest
from calculator import Calculator


def test_basic_arithmetic():
    calc = Calculator()
    assert calc.add(10, 5) == 15
    assert calc.subtract(10, 5) == 5
    assert calc.multiply(10, 5) == 50
    assert calc.divide(10, 5) == 2


def test_harmonic_mean_standard():
    calc = Calculator()
    assert round(calc.harmonic_mean([2.0, 4.0, 8.0]), 2) == 3.43


def test_percentile_median():
    calc = Calculator()
    assert calc.percentile([1, 2, 3, 4, 5], 0.5) == 3
