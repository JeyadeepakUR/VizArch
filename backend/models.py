"""
Pydantic models for Virtual Infrastructure Composition Lab.
Uses Pydantic v2 syntax with Python 3.11+.
"""

from typing import Literal
from pydantic import BaseModel, Field, field_validator, model_validator


ComponentType = Literal[
    # AWS Services
    "lambda",
    "s3",
    "dynamodb",
    "cloudfront",
    "api_gateway",
    "amplify",
    "rds",
    "elasticache",
    "sqs",
    "sns",
    "load_balancer",
    # AWS Networking
    "vpc",
    "subnet",
    "security_group",
    "nat_gateway",
    "internet_gateway",
    # Generic
    "compute_node",
    "database",
    "cache",
    "message_queue"
]

SimulationGoal = Literal["low_latency", "high_availability", "low_cost"]


class InfrastructureComponent(BaseModel):
    """Single infrastructure component in the system."""
    
    id: str = Field(..., description="Unique identifier")
    type: ComponentType = Field(..., description="Component type")
    configuration: dict = Field(default_factory=dict, description="Component config")

    @field_validator('id')
    @classmethod
    def validate_id(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Component ID cannot be empty")
        return v.strip()


class InfrastructureLayout(BaseModel):
    """Complete infrastructure layout with components and connections."""
    
    components: list[InfrastructureComponent] = Field(..., min_length=1)
    connections: list[tuple[str, str]] = Field(default_factory=list)

    @field_validator('components')
    @classmethod
    def validate_components(cls, v: list[InfrastructureComponent]) -> list[InfrastructureComponent]:
        if not v:
            raise ValueError("Layout must contain at least one component")
        
        ids = [comp.id for comp in v]
        if len(ids) != len(set(ids)):
            raise ValueError("Component IDs must be unique")
        
        return v

    @field_validator('connections')
    @classmethod
    def validate_connections(cls, v: list[tuple[str, str]]) -> list[tuple[str, str]]:
        for conn in v:
            if len(conn) != 2:
                raise ValueError("Each connection must be a tuple of (from_id, to_id)")
            if conn[0] == conn[1]:
                raise ValueError("Component cannot connect to itself")
        return v

    @model_validator(mode='after')
    def validate_topology(self):
        """Validate infrastructure topology."""
        component_ids = {comp.id for comp in self.components}
        
        # Validate connection references
        for from_id, to_id in self.connections:
            if from_id not in component_ids:
                raise ValueError(f"Connection references non-existent component: {from_id}")
            if to_id not in component_ids:
                raise ValueError(f"Connection references non-existent component: {to_id}")
        
        # Check for database without compute node
        has_database = any(comp.type == "database" for comp in self.components)
        has_compute = any(comp.type == "compute_node" for comp in self.components)
        
        if has_database and not has_compute:
            raise ValueError("Database component requires at least one compute node")
        
        return self


class SimulationRequest(BaseModel):
    """Request to simulate an infrastructure layout."""
    
    layout: InfrastructureLayout
    goal: SimulationGoal


class SimulationResult(BaseModel):
    """Result of infrastructure simulation."""
    
    estimated_latency_ms: int = Field(..., ge=1)
    scalability_score: int = Field(..., ge=0, le=100)
    cost_index: int = Field(..., ge=0, le=100)
    explanation: str = Field(..., min_length=10)

    @field_validator('explanation')
    @classmethod
    def validate_explanation(cls, v: str) -> str:
        if not v or len(v.strip()) < 10:
            raise ValueError("Explanation must be at least 10 characters")
        return v.strip()


class ProposalRequest(BaseModel):
    """Request for generating a business proposal PDF."""

    layout: InfrastructureLayout
    goal: SimulationGoal
    use_case: str = ""
