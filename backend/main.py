"""
FastAPI backend for Virtual Infrastructure Composition Lab.
Holographic infrastructure simulator.
"""

from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from models import SimulationRequest, SimulationResult, ProposalRequest
from ai_service import (
    generate_explanation,
    generate_architecture_suggestions,
    generate_optimal_topology,
    generate_proposal,
)
from pricing import estimate_cost
from proposal_pdf import build_proposal_pdf

app = FastAPI(
    title="VizArch Backend",
    description="Infrastructure visualization and composition engine",
    version="1.0.0"
)

# CORS configuration - allow both local development and production
allowed_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def calculate_metrics(layout: dict, goal: str) -> tuple[int, int, int]:
    """
    Calculate infrastructure metrics using realistic AWS performance characteristics.
    
    Considers:
    - Actual service latencies (API Gateway, Lambda cold/warm starts, database query times)
    - Network hops and regional latency
    - Caching layers and CDN impact
    - Redundancy and availability zones for HA
    - Real bottlenecks (database connections, Lambda concurrency)
    
    Returns:
        (latency_ms, scalability_score, cost_index)
    """
    components = layout.get('components', [])
    connections = layout.get('connections', [])
    
    # Realistic AWS service characteristics (baseline latencies in ms, scalability max score)
    service_profiles = {
        # Compute
        "lambda": {"base_latency": 15, "cold_start": 100, "scalability": 95, "bottleneck": False},
        "compute_node": {"base_latency": 5, "cold_start": 0, "scalability": 85, "bottleneck": False},
        
        # Storage
        "s3": {"base_latency": 10, "cold_start": 0, "scalability": 98, "bottleneck": False},
        "dynamodb": {"base_latency": 8, "cold_start": 0, "scalability": 95, "bottleneck": False},
        "rds": {"base_latency": 12, "cold_start": 0, "scalability": 60, "bottleneck": True},
        "database": {"base_latency": 12, "cold_start": 0, "scalability": 60, "bottleneck": True},
        
        # Caching (reduces downstream latency)
        "elasticache": {"base_latency": 2, "cold_start": 0, "scalability": 90, "latency_reduction": 0.6},
        "cache": {"base_latency": 2, "cold_start": 0, "scalability": 90, "latency_reduction": 0.6},
        "cloudfront": {"base_latency": 15, "cold_start": 0, "scalability": 99, "latency_reduction": 0.5},
        
        # API/Gateway
        "api_gateway": {"base_latency": 8, "cold_start": 0, "scalability": 98, "bottleneck": False},
        "load_balancer": {"base_latency": 3, "cold_start": 0, "scalability": 95, "bottleneck": False},
        
        # Messaging
        "sqs": {"base_latency": 20, "cold_start": 0, "scalability": 99, "bottleneck": False},
        "sns": {"base_latency": 25, "cold_start": 0, "scalability": 99, "bottleneck": False},
        "message_queue": {"base_latency": 20, "cold_start": 0, "scalability": 99, "bottleneck": False},
        
        # Hosting
        "amplify": {"base_latency": 50, "cold_start": 0, "scalability": 85, "bottleneck": False},
        
        # Networking (transparent, but count for topology complexity)
        "vpc": {"base_latency": 0, "cold_start": 0, "scalability": 100, "bottleneck": False},
        "subnet": {"base_latency": 0, "cold_start": 0, "scalability": 100, "bottleneck": False},
        "security_group": {"base_latency": 0, "cold_start": 0, "scalability": 100, "bottleneck": False},
        "nat_gateway": {"base_latency": 2, "cold_start": 0, "scalability": 95, "bottleneck": False},
        "internet_gateway": {"base_latency": 1, "cold_start": 0, "scalability": 98, "bottleneck": False},
    }
    
    # Count component types for topology analysis
    comp_counts = {}
    has_cache = False
    has_cdn = False
    has_database = False
    has_load_balancer = False
    bottleneck_services = 0
    
    for comp in components:
        comp_type = comp.get('type', 'compute_node')
        comp_counts[comp_type] = comp_counts.get(comp_type, 0) + 1
        
        if comp_type in ["cache", "elasticache"]:
            has_cache = True
        if comp_type == "cloudfront":
            has_cdn = True
        if comp_type in ["database", "rds", "dynamodb"]:
            has_database = True
        if comp_type == "load_balancer":
            has_load_balancer = True
        if service_profiles.get(comp_type, {}).get("bottleneck"):
            bottleneck_services += 1
    
    # Calculate latency: sum of service latencies + network hops
    total_latency = 0.0
    scalability_scores = []
    
    for comp in components:
        comp_type = comp.get('type', 'compute_node')
        profile = service_profiles.get(comp_type, {"base_latency": 10, "cold_start": 0, "scalability": 70})
        
        # Add base latency
        latency = profile["base_latency"]
        
        # Lambda cold start penalty (10% of invocations)
        if comp_type == "lambda":
            latency += profile["cold_start"] * 0.1
        
        total_latency += latency
        scalability_scores.append(profile["scalability"])
    
    # Network latency: each connection adds 1-3ms depending on complexity
    connection_latency = len(connections) * 2.5
    total_latency += connection_latency
    
    # Caching benefit: reduce latency by 40-60% if cache present
    if has_cache:
        total_latency *= 0.5
    if has_cdn:
        total_latency *= 0.6
    
    # Load balancer adds slight overhead but improves availability
    if has_load_balancer:
        total_latency += 3
    
    # Calculate scalability: average of component scalability minus bottlenecks
    if scalability_scores:
        avg_scalability = sum(scalability_scores) / len(scalability_scores)
    else:
        avg_scalability = 50
    
    # Redundancy bonus: multiple instances of same service type improve scalability
    redundancy_bonus = 0
    for count in comp_counts.values():
        if count > 1:
            redundancy_bonus += min((count - 1) * 5, 15)
    
    avg_scalability += redundancy_bonus
    
    # Bottleneck penalty: databases and stateful services limit scalability
    avg_scalability -= bottleneck_services * 15
    
    # Load balancer improves scalability significantly
    if has_load_balancer:
        avg_scalability += 10
    
    # Cost index: realistic baseline 10-70 range for typical architectures
    cost_index = 10  # Base infrastructure cost
    expensive_services = ["rds", "database", "elasticache", "load_balancer", "nat_gateway", "amplify"]
    for comp in components:
        comp_type = comp.get('type')
        if comp_type in expensive_services:
            cost_index += 8  # Expensive services add more
        else:
            cost_index += 3  # Cheap services (Lambda, S3, etc.)
    
    # Redundancy increases cost moderately
    cost_index += redundancy_bonus * 1.5
    
    # Apply goal optimizations (realistic tradeoffs)
    if goal == "low_latency":
        # Assume architecture includes more caching, CDN, closer regions
        total_latency *= 0.75
        cost_index *= 1.25  # More infrastructure for lower latency
    elif goal == "high_availability":
        # More redundancy and multi-AZ
        avg_scalability *= 1.25
        cost_index *= 1.15  # Redundancy costs money
        total_latency *= 1.05  # Slight latency increase due to replication
    elif goal == "low_cost":
        # Fewer redundant services, minimal infrastructure
        cost_index *= 0.7
        total_latency *= 1.15  # Less caching/optimization
        avg_scalability *= 0.85  # Less redundancy
    
    # Final clamping to realistic ranges
    latency_ms = int(max(5, min(total_latency, 500)))
    scalability_score = int(max(0, min(avg_scalability, 100)))
    cost_index = int(max(0, min(cost_index, 100)))
    
    return latency_ms, scalability_score, cost_index


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "operational", "service": "Virtual Infrastructure Lab"}


@app.post("/simulate", response_model=SimulationResult)
async def simulate_infrastructure(request: SimulationRequest):
    """
    Simulate infrastructure layout and return metrics.
    
    This endpoint:
    1. Validates the infrastructure layout
    2. Calculates performance metrics
    3. Generates AI explanation via OpenRouter
    4. Returns comprehensive results
    """
    try:
        # Calculate metrics
        layout_dict = request.layout.model_dump()
        latency, scalability, cost = calculate_metrics(layout_dict, request.goal)
        
        # Generate AI explanation
        explanation = await generate_explanation(
            layout=layout_dict,
            goal=request.goal,
            estimated_latency_ms=latency,
            scalability_score=scalability,
            cost_index=cost
        )
        
        return SimulationResult(
            estimated_latency_ms=latency,
            scalability_score=scalability,
            cost_index=cost,
            explanation=explanation
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation error: {str(e)}")


@app.post("/suggestions")
async def get_architecture_suggestions(request: SimulationRequest):
    """
    Get AI-powered architecture improvement suggestions.
    
    Analyzes the current infrastructure and provides specific recommendations
    for achieving the selected goal, including:
    - Components to add
    - Connections to create
    - Components to remove
    - Architecture patterns to consider
    """
    try:
        # Calculate current metrics
        layout_dict = request.layout.model_dump()
        latency, scalability, cost = calculate_metrics(layout_dict, request.goal)
        
        # Generate AI suggestions
        suggestions = await generate_architecture_suggestions(
            layout=layout_dict,
            goal=request.goal,
            current_latency=latency,
            current_scalability=scalability,
            current_cost=cost
        )
        
        return {
            "suggestions": suggestions,
            "current_metrics": {
                "latency": latency,
                "scalability": scalability,
                "cost": cost
            }
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Suggestion generation error: {str(e)}")


class TopologyRequest(BaseModel):
    goal: str
    use_case: str = ""


@app.post("/generate-topology")
async def generate_topology(request: TopologyRequest):
    """
    Generate an optimal infrastructure topology using AI.
    
    Takes a goal and optional use case description, returns a complete 
    infrastructure layout with specific cloud services tailored to the use case.
    """
    try:
        topology = await generate_optimal_topology(request.goal, request.use_case)
        return topology
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate-proposal")
async def generate_proposal_pdf(request: ProposalRequest):
    """
    Generate a business-ready PDF proposal for the given topology.
    Includes cost breakdown, rationale, and next steps.
    """
    try:
        layout_dict = request.layout.model_dump()
        latency, scalability, cost_index = calculate_metrics(layout_dict, request.goal)

        total_monthly, breakdown = estimate_cost(layout_dict)

        proposal_sections = await generate_proposal(
            layout=layout_dict,
            goal=request.goal,
            use_case=request.use_case,
            cost_breakdown=breakdown,
            total_monthly=total_monthly,
            metrics={
                "latency_ms": latency,
                "scalability": scalability,
                "cost_index": cost_index,
            },
        )

        pdf_bytes = build_proposal_pdf(
            proposal=proposal_sections,
            cost_breakdown=breakdown,
            total_monthly=total_monthly,
            metadata={"use_case": request.use_case, "goal": request.goal},
        )

        headers = {"Content-Disposition": "attachment; filename=proposal.pdf"}
        return Response(content=pdf_bytes, media_type="application/pdf", headers=headers)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Proposal generation error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
