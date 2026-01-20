export type ComponentType = 
  // AWS Services
  | 'lambda'
  | 's3'
  | 'dynamodb'
  | 'cloudfront'
  | 'api_gateway'
  | 'amplify'
  | 'rds'
  | 'elasticache'
  | 'sqs'
  | 'sns'
  | 'load_balancer'
  // AWS Networking
  | 'vpc'
  | 'subnet'
  | 'security_group'
  | 'nat_gateway'
  | 'internet_gateway'
  // Generic
  | 'compute_node'
  | 'database'
  | 'cache'
  | 'message_queue';

export type SimulationGoal = 'low_latency' | 'high_availability' | 'low_cost';

export interface InfrastructureComponent {
  id: string;
  type: ComponentType;
  configuration: Record<string, any>;
  position?: { x: number; y: number; z: number };
}

export interface InfrastructureLayout {
  components: InfrastructureComponent[];
  connections: [string, string][];
}

export interface SimulationRequest {
  layout: InfrastructureLayout;
  goal: SimulationGoal;
}

export interface SimulationResult {
  estimated_latency_ms: number;
  scalability_score: number;
  cost_index: number;
  explanation: string;
}
