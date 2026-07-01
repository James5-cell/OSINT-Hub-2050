"""
conftest.py — pytest configuration
Ensures the repo root is on sys.path for all test imports.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
