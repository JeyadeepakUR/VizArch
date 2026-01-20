import axios from 'axios';
import { SimulationRequest, SimulationResult } from '@/types/infrastructure';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const simulateInfrastructure = async (
  request: SimulationRequest
): Promise<SimulationResult> => {
  const response = await api.post<SimulationResult>('/simulate', request);
  return response.data;
};

export const getArchitectureSuggestions = async (
  request: SimulationRequest
): Promise<{ suggestions: string; current_metrics: { latency: number; scalability: number; cost: number } }> => {
  const response = await api.post('/suggestions', request);
  return response.data;
};

export const generateOptimalTopology = async (
  goal: string,
  useCase?: string
): Promise<{ components: Array<{ type: string; id: string }>; connections: [string, string][] }> => {
  const response = await api.post('/generate-topology', { goal, use_case: useCase });
  return response.data;
};

export const generateProposalPdf = async (
  request: SimulationRequest & { use_case?: string }
): Promise<Blob> => {
  const response = await api.post('/generate-proposal', request, {
    responseType: 'blob',
    headers: { Accept: 'application/pdf' },
  });
  return response.data;
};

export const healthCheck = async (): Promise<{ status: string; service: string }> => {
  const response = await api.get('/health');
  return response.data;
};
