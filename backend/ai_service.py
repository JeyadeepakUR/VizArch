"""
AI service using structured Pydantic models with OpenRouter for infrastructure operations.
Production-grade LLM application with automatic validation and error handling.
Demonstrates best practices for generative AI with structured outputs.
"""

import os
import json
import httpx
import asyncio
from pydantic import BaseModel, Field, ValidationError
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_SITE = os.getenv("OPENROUTER_SITE", "http://localhost:3000")
OPENROUTER_TITLE = os.getenv("OPENROUTER_TITLE", "Virtual Infrastructure Lab")

# Validate API key
if not OPENROUTER_API_KEY:
    raise RuntimeError("OPENROUTER_API_KEY not configured in .env")

# Model configuration for OpenRouter
OPENROUTER_API_BASE = "https://openrouter.ai/api/v1"
MODEL_ID = "xiaomi/mimo-v2-flash:free"  # Proven reliable free model
# ============================================================================
# Structured Response Models (Pydantic for automatic validation)
# ============================================================================

class InfrastructureComponentResponse(BaseModel):
    """Single infrastructure component with type validation."""
    type: str = Field(..., description="Component type (lambda, s3, dynamodb, etc.)")
    id: str = Field(..., description="Unique ID like 'lambda-1'")


class TopologyResponse(BaseModel):
    """Infrastructure topology with components and connections."""
    components: list[InfrastructureComponentResponse] = Field(
        ..., description="List of infrastructure components"
    )
    connections: list[list[str]] = Field(
        ..., description="List of connections as [from_id, to_id] pairs"
    )


class ExplanationResponse(BaseModel):
    """AI explanation of infrastructure analysis."""
    explanation: str = Field(..., description="Technical explanation")


class SuggestionsResponse(BaseModel):
    """Architecture improvement suggestions."""
    suggestions: str = Field(..., description="Actionable recommendations")


class ProposalResponse(BaseModel):
    """Proposal narrative for a generated architecture."""
    executive_summary: str = Field(..., description="High-level summary for executives")
    architecture_rationale: str = Field(..., description="Why this topology fits the goal")
    component_choices: str = Field(..., description="Why these services over alternatives")
    tradeoffs: str = Field(..., description="Trade-offs vs other options")
    risks: str = Field(..., description="Risks and mitigations")
    next_steps: str = Field(..., description="Recommended next actions")



# Helper function to call OpenRouter API directly
async def _call_openrouter_json(
    prompt: str,
    system_prompt: str = "",
    response_model: type[BaseModel] | None = None,
    max_retries: int = 3
) -> str:
    """
    Call OpenRouter API and extract JSON response.
    Uses bracket-matching for robust JSON extraction and Pydantic validation.
    Demonstrates production-grade error handling and retries.
    
    Args:
        prompt: User prompt
        system_prompt: System context
        response_model: Pydantic model for validation
        max_retries: Number of retries on failure
        
    Returns:
        JSON string matching response_model schema
    """
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": OPENROUTER_SITE,
        "X-Title": OPENROUTER_TITLE
    }
    
    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    
    # Add JSON schema instruction if response model provided
    if response_model:
        schema_str = json.dumps(response_model.model_json_schema(), indent=2)
        messages.append({
            "role": "system",
            "content": f"Respond with valid JSON matching this schema:\n{schema_str}"
        })
    
    messages.append({"role": "user", "content": prompt})
    
    payload = {
        "model": MODEL_ID,
        "messages": messages,
        "max_tokens": 2048,
        "temperature": 0.7
    }
    
    last_error = None
    for attempt in range(max_retries):
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{OPENROUTER_API_BASE}/chat/completions",
                    json=payload,
                    headers=headers,
                    timeout=30
                )
                response.raise_for_status()
                result = response.json()
                content = result["choices"][0]["message"]["content"]
                
                # Extract JSON from response using bracket matching
                json_str = _extract_json_from_text(content)
                
                # Validate if model provided
                if response_model:
                    parsed = response_model.model_validate_json(json_str)
                    return json_str
                
                return json_str
                
        except (json.JSONDecodeError, ValidationError, httpx.HTTPError) as e:
            last_error = e
            if attempt < max_retries - 1:
                await asyncio.sleep(1)  # Wait before retry
                continue
    
    raise ValueError(f"Failed after {max_retries} retries: {last_error}")


def _extract_json_from_text(text: str) -> str:
    """
    Extract JSON from LLM response using bracket matching.
    Handles multi-line JSON and extra text robustly.
    """
    # Find first { and match to closing }
    start_idx = text.find('{')
    if start_idx == -1:
        raise ValueError("No JSON object found in response")
    
    bracket_count = 0
    for i in range(start_idx, len(text)):
        if text[i] == '{':
            bracket_count += 1
        elif text[i] == '}':
            bracket_count -= 1
            if bracket_count == 0:
                return text[start_idx:i+1]
    
    raise ValueError("Unmatched brackets in JSON")


async def generate_explanation(
    layout: dict,
    goal: str,
    estimated_latency_ms: int,
    scalability_score: int,
    cost_index: int
) -> str:
    """
    Generate AI explanation of simulation results.
    Uses structured Pydantic models for automatic validation.
    
    Returns:
        AI-generated explanation string
    """
    component_summary = ", ".join([
        f"{comp['type']} ({comp['id']})" 
        for comp in layout.get('components', [])
    ])
    
    prompt = f"""Analyze this infrastructure simulation:
- Components: {component_summary}
- Connections: {len(layout.get('connections', []))} links
- Goal: {goal}
- Latency: {estimated_latency_ms}ms, Scalability: {scalability_score}/100, Cost: {cost_index}/100

Respond as JSON:
{{"explanation": "<2-3 sentence Jarvis-style analysis explaining key trade-offs and goal achievement>"}}"""

    system_prompt = "You are an expert cloud infrastructure architect. Respond with valid JSON only."
    
    try:
        json_response = await _call_openrouter_json(
            prompt,
            system_prompt=system_prompt,
            response_model=ExplanationResponse,
            max_retries=3
        )
        data = ExplanationResponse.model_validate_json(json_response)
        return data.explanation
    except Exception as e:
        raise ValueError(f"Explanation generation failed: {str(e)}")




async def generate_architecture_suggestions(
    layout: dict,
    goal: str,
    current_latency: int,
    current_scalability: int,
    current_cost: int
) -> str:
    """
    Generate AI-powered architecture improvement suggestions.
    Validates output with Pydantic and retries on failure.
    
    Returns:
        AI-generated suggestions string
    """
    components = layout.get('components', [])
    connections = layout.get('connections', [])

    component_types = {}
    for comp in components:
        comp_type = comp['type']
        component_types[comp_type] = component_types.get(comp_type, 0) + 1
    
    component_summary = ", ".join([f"{count}x {ctype}" for ctype, count in component_types.items()])
    
    goal_contexts = {
        "low_latency": "minimize response time with caching and load balancing",
        "high_availability": "maximize uptime through redundancy and failover",
        "low_cost": "minimize expenses with minimal redundancy"
    }
    
    goal_context = goal_contexts.get(goal, goal_contexts["low_latency"])
    
    prompt = f"""Analyze this cloud infrastructure and suggest improvements:
- Goal: {goal} ({goal_context})
- Components: {component_summary}
- Total: {len(components)} components, {len(connections)} connections
- Metrics: Latency={current_latency}ms, Scalability={current_scalability}/100, Cost={current_cost}/100

Respond as JSON:
{{"suggestions": "<2-3 specific, actionable recommendations to improve for {goal}>"}}"""

    system_prompt = "You are an expert cloud architect. Respond with valid JSON only."
    
    try:
        json_response = await _call_openrouter_json(
            prompt,
            system_prompt=system_prompt,
            response_model=SuggestionsResponse,
            max_retries=3
        )
        data = SuggestionsResponse.model_validate_json(json_response)
        return data.suggestions
    except Exception as e:
        raise ValueError(f"Suggestions generation failed: {str(e)}")




async def generate_optimal_topology(goal: str, use_case: str = "") -> dict:
    """
    Generate an optimal infrastructure topology.
    Automatically validates output structure with Pydantic and retries on failure.
    Demonstrates production-grade generative AI with structured validation.
    
    Returns:
        Dict with 'components' list and 'connections' list
    """
    goal_contexts = {
        "low_latency": {
            "target": "minimize response time",
            "architecture_style": "minimize hops, add caching layers"
        },
        "high_availability": {
            "target": "maximize uptime and fault tolerance",
            "architecture_style": "redundancy, failover, distributed"
        },
        "low_cost": {
            "target": "minimize infrastructure expenses",
            "architecture_style": "simple, minimal redundancy"
        }
    }
    
    goal_context = goal_contexts.get(goal, goal_contexts["low_latency"])
    
    use_case_context = ""
    if use_case:
        use_case_context = f"\nUse case: {use_case}\nDesign architecture specifically for this."
    
    prompt = f"""Generate a realistic AWS infrastructure topology for:
Goal: {goal} - {goal_context['target']}
Architecture: {goal_context['architecture_style']}{use_case_context}

Create 6-12 components following AWS best practices:
- Valid types: lambda, s3, dynamodb, cloudfront, api_gateway, amplify, rds, elasticache, sqs, sns, load_balancer, vpc, subnet, security_group, nat_gateway, internet_gateway
- Each component: unique id like "type-number"
- Include VPC networking for private resources
- RDS/ElastiCache must be in VPC with security groups
- Lambda accessing databases must be in same VPC
- Create realistic connections between components

Respond as valid JSON with components array and connections array."""

    system_prompt = """You are an AWS cloud architect expert. 
Generate realistic infrastructure topologies following AWS best practices.
Respond with ONLY valid JSON, no other text."""
    
    try:
        json_response = await _call_openrouter_json(
            prompt,
            system_prompt=system_prompt,
            response_model=TopologyResponse,
            max_retries=3
        )
        data = TopologyResponse.model_validate_json(json_response)
        
        # Normalize any generic types to AWS-specific ones
        type_map = {
            "database": "rds",
            "cache": "elasticache",
            "message_queue": "sqs",
            "compute_node": "lambda",
        }
        
        normalized_components = []
        for comp in data.components:
            normalized_type = type_map.get(comp.type, comp.type)
            normalized_components.append({
                "type": normalized_type,
                "id": comp.id
            })
        
        return {
            "components": normalized_components,
            "connections": data.connections
        }
    except Exception as e:
        raise ValueError(f"Topology generation failed: {str(e)}")


async def generate_proposal(
    layout: dict,
    goal: str,
    use_case: str,
    cost_breakdown: list[dict],
    total_monthly: float,
    metrics: dict
) -> dict:
    """
    Generate a business-ready proposal for the given topology.
    Returns structured sections suitable for PDF export.
    """
    component_summary = ", ".join([
        f"{c['type']} ({c['id']})" for c in layout.get("components", [])
    ])

    cost_lines = "\n".join([
        f"- {item['service']}: {item['count']} x ${item['unit_monthly_usd']:.2f} = ${item['subtotal_monthly_usd']:.2f}"
        for item in cost_breakdown
    ])

    prompt = f"""Create a concise business proposal for this cloud architecture.
Use case: {use_case or 'Not specified'}
Goal: {goal}
Components: {component_summary}
Metrics: latency={metrics.get('latency_ms')}ms, scalability={metrics.get('scalability')}/100, cost_index={metrics.get('cost_index')}/100
Estimated monthly cost: ${total_monthly:.2f}
Cost breakdown:\n{cost_lines}

Respond as JSON with these fields:
{{
  "executive_summary": "2-3 sentence business summary",
  "architecture_rationale": "why this topology supports the goal and use case",
  "component_choices": "why these services vs alternatives",
  "tradeoffs": "key trade-offs and mitigations",
  "risks": "deployment/operational risks and mitigations",
  "next_steps": "clear next actions"
}}"""

    system_prompt = "You are a senior cloud architect writing for executives. Be formal, clear, and concise. Respond with JSON only."

    try:
        json_response = await _call_openrouter_json(
            prompt,
            system_prompt=system_prompt,
            response_model=ProposalResponse,
            max_retries=3
        )
        data = ProposalResponse.model_validate_json(json_response)
        return data.model_dump()
    except Exception as e:
        raise ValueError(f"Proposal generation failed: {str(e)}")

