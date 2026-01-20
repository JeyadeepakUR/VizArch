"""
Simple AWS cost estimator for generated topologies.
Uses conservative baseline monthly estimates per component type.
This is not exact AWS billing, but provides a realistic ballpark for proposals.
"""

from collections import Counter
from typing import Dict, List, Tuple

# Baseline monthly estimates in USD (light usage assumptions)
PRICE_TABLE: Dict[str, float] = {
    "lambda": 5.0,
    "s3": 3.0,
    "dynamodb": 30.0,
    "cloudfront": 15.0,
    "api_gateway": 20.0,
    "amplify": 25.0,
    "rds": 120.0,
    "elasticache": 80.0,
    "sqs": 5.0,
    "sns": 5.0,
    "load_balancer": 25.0,
    "vpc": 0.0,
    "subnet": 0.0,
    "security_group": 0.0,
    "nat_gateway": 32.0,  # assumes ~100 GB data processed
    "internet_gateway": 5.0,
    "compute_node": 40.0,  # generic EC2-lite estimate
    "database": 120.0,     # align with rds default
    "cache": 80.0,         # align with elasticache
    "message_queue": 5.0,  # align with sqs
}


def estimate_cost(layout: dict) -> Tuple[float, List[Dict[str, float]]]:
    """Estimate monthly cost for a topology.

    Args:
        layout: Dict with components list (each having a `type`).

    Returns:
        (total_monthly_usd, breakdown list of dicts)
    """
    components = layout.get("components", [])
    counts = Counter(comp.get("type", "unknown") for comp in components)

    breakdown = []
    total = 0.0

    for comp_type, count in counts.items():
        unit_cost = PRICE_TABLE.get(comp_type, 15.0)  # fallback estimate
        subtotal = unit_cost * count
        total += subtotal
        breakdown.append(
            {
                "service": comp_type,
                "count": count,
                "unit_monthly_usd": round(unit_cost, 2),
                "subtotal_monthly_usd": round(subtotal, 2),
            }
        )

    # Sort breakdown by subtotal descending for readability
    breakdown.sort(key=lambda x: x["subtotal_monthly_usd"], reverse=True)

    return round(total, 2), breakdown
