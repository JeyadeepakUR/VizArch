# VizArch - Infrastructure Visualization & Architecture

An interactive 3D infrastructure composition and simulation system. Build, visualize, and simulate AWS data center architectures with AI-powered analysis and professional reporting.

![Virtual Infrastructure Lab](https://img.shields.io/badge/Status-Active-success)
![Python](https://img.shields.io/badge/Python-3.11-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![React Three Fiber](https://img.shields.io/badge/R3F-8.15-purple)

## Overview

VizArch enables users to compose AWS infrastructure architectures through an intuitive 3D interface, then simulate their performance characteristics and generate professional proposals with cost breakdowns.

### Key Features

- **3D Interactive Visualization**: Interactive Three.js-powered scene with component placement and drag-and-drop
- **Component Library**: 17 AWS services with real-time tooltips showing cost and latency estimates
- **Real-time Simulation**: Realistic AWS service profiles with latency, scalability, and cost metrics
- **AI Analysis**: OpenRouter-powered infrastructure explanations, topology generation, and PDF proposals
- **Multiple Optimization Goals**: Low latency, high availability, or low cost optimization
- **Interactive Features**: 
  - Component search and filtering
  - Pre-built architecture templates (Three-tier, Serverless, Static Site, Microservices)
  - Results history with restoration of past simulations
  - Keyboard shortcuts (Space: simulate, Delete: remove, Escape: deselect)
  - Real-time status bar with component count, connections, and estimated cost
  - Color-coded latency metrics and animated progress bars
  - Professional PDF proposal export with cost breakdowns

## Architecture

### Backend (FastAPI + Python 3.11)

- **FastAPI Server**: High-performance async API with auto-generated OpenAPI docs
- **Pydantic v2 Models**: Type-safe data validation and serialization
- **Simulation Engine**: Heuristic-based metrics calculation for latency, scalability, and cost
- **AI Service**: OpenRouter API integration for generating infrastructure explanations
- **CORS Enabled**: Allows frontend communication from localhost:3000

### Frontend (Next.js 14 + React Three Fiber)

- **Next.js 14**: React framework with App Router and server components
- **React Three Fiber**: Declarative 3D scene management with Three.js
- **Zustand**: Lightweight state management for component and connection tracking
- **Framer Motion**: Smooth animations and transitions
- **Tailwind CSS**: Utility-first styling with modern design
- **TypeScript**: Full type safety across the frontend

## Installation

### Prerequisites

**IMPORTANT**: This project requires **Python 3.11** (NOT 3.12, 3.13, or 3.14) to avoid Pydantic v2 compilation issues.

- Python 3.11.x
- Node.js 18+ and npm
- Git

### Backend Setup

```bash
# Navigate to backend directory
cd vizarch/backend

# Create virtual environment with Python 3.11
python3.11 -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
# Copy .env and add your OpenRouter API key
# Get a key from: https://openrouter.ai/keys
# Edit .env and replace 'your_key_here' with your actual key
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd vizarch/frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

## Usage

### 1. Start the Backend

```bash
cd vizarch/backend
venv\Scripts\activate  # On Windows
python main.py
```

The API will be available at `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

### 2. Start the Frontend

```bash
cd vizarch/frontend
npm run dev
```

The web interface will be available at `http://localhost:3000`

### 3. Build Your Infrastructure

1. **Use Templates or Build Custom**: 
   - Click **Templates** dropdown to load a pre-built architecture, OR
   - Use **Component Palette** (bottom-left hamburger menu) to add components individually
   - Hover over components to see tooltips with estimated cost and latency
   - Use search bar in palette to filter components
2. **Arrange Components**: Drag to position in 3D space, click to connect components
3. **Set Use Case & Goal**: 
   - Enter use case (optional) for AI-powered topology suggestions
   - Choose optimization goal:
     - **Low Latency**: Minimize response time
     - **High Availability**: Maximize uptime and redundancy
     - **Low Cost**: Minimize infrastructure expenses
4. **Run Simulation**: 
   - Press **Space** or click **Simulate** button
   - View real-time metrics with color-coded latency (green/yellow/red)
5. **View Results & History**: 
   - See animated progress bars for scalability and cost
   - Restore previous simulations from **History** dropdown
6. **Generate Proposal**: Click **PDF** to export professional proposal with cost breakdown and AI analysis

## API Endpoints

### `GET /health`
Health check endpoint

**Response:**
```json
{
  "status": "operational",
  "service": "Virtual Infrastructure Lab"
}
```

### `POST /simulate`
Simulate infrastructure layout

**Request:**
```json
{
  "layout": {
    "components": [
      {
        "id": "lb-1",
        "type": "load_balancer",
        "configuration": {}
      }
    ],
    "connections": [["lb-1", "compute-1"]]
  },
  "goal": "low_latency"
}
```

**Response:**
```json
{
  "estimated_latency_ms": 45,
  "scalability_score": 75,
  "cost_index": 60,
  "explanation": "AI-generated analysis..."
}
```

## Component Types (17 AWS Services)

| Component | Category | Base Latency | Cost/Month | Best For |
|-----------|----------|--------------|-----------|----------|
| Lambda | Compute | 15ms | $5 | Serverless functions |
| S3 | Storage | 20ms | $3 | Object storage, CDN origin |
| DynamoDB | Database | 8ms | $30 | NoSQL, high throughput |
| CloudFront | CDN | 15ms | $15 | Content delivery |
| API Gateway | Networking | 8ms | $20 | REST API endpoints |
| RDS | Database | 12ms | $120 | Relational data |
| ElastiCache | Cache | 2ms | $80 | Redis/Memcached layer |
| SQS/SNS | Messaging | 5ms | $5 | Async messaging, events |
| Load Balancer | Networking | 8ms | $25 | Traffic distribution |
| NAT Gateway | Networking | 10ms | $32 | Outbound internet access |
| Internet Gateway | Networking | 2ms | $0 | Inbound internet access |
| VPC | Networking | 0ms | $0 | Virtual private network |
| Subnet | Networking | 0ms | $0 | Network segmentation |
| Security Group | Security | 0ms | $0 | Firewall rules |
| Amplify | Platform | 25ms | $50 | Web hosting and CI/CD |
| EC2 (Compute Node) | Compute | 10ms | $40 | Traditional instances |
| Generic Database | Database | 15ms | $60 | Placeholder for any DB |

*All costs are baseline monthly estimates for light usage; actual costs vary with usage patterns*

## Simulation Metrics

### Latency (milliseconds)
**Color-Coded Display**:
- 🟢 **Green** (<50ms): Excellent, low-latency architecture
- 🟡 **Yellow** (50-150ms): Acceptable, moderate latency
- 🔴 **Red** (>150ms): Poor, high-latency issues

**Calculated from**:
- Base latency of each component (Lambda 15ms, DynamoDB 8ms, ElastiCache 2ms, etc.)
- Lambda cold starts (100ms penalty at 10% rate)
- Network hop delays (+2ms per connection)
- Cache layer benefits (ElastiCache reduces by 60%, CloudFront by 50%)
- Database bottlenecks (RDS caps scalability at 60/100)

### Scalability Score (0-100)
Animated progress bar showing ability to handle increased load:
- Limited by bottleneck services (RDS max 60/100)
- Improved with load balancers and message queues
- Reduces with increasing component count and connections

### Cost Index (Estimated $/month)
**Real Dollar Estimates**:
- Formula: $10 baseline + ($8 per expensive service) + ($3 per cheap service)
- Typically ranges from $10-70+
- Includes AWS service baseline costs for light usage
- Multiply by 2.5 for typical medium-scale deployment

## Technology Stack

### Backend
- **FastAPI 0.109.0**: High-performance async web framework
- **Pydantic 2.12.5**: Data validation with automatic OpenAPI docs
- **Uvicorn 0.27.0**: ASGI server with auto-reload
- **HTTPX 0.28.1**: Async HTTP client for OpenRouter API
- **fpdf2 2.7.9**: Pure-Python PDF generation
- **PydanticAI 1.44.0**: LLM integration framework
- **python-dotenv 1.0.0**: Environment variable management

### Frontend
- **Next.js 14.1.0**: React framework with App Router
- **React 18.2.0**: UI library with hooks
- **React Three Fiber 8.15.0**: Declarative 3D with Three.js
- **@react-three/drei 9.95.0**: R3F component helpers
- **Three.js 0.160.0**: WebGL 3D graphics library
- **Zustand 4.4.7**: Minimal state management
- **Framer Motion 10.18.0**: Spring physics animations
- **Axios 1.6.5**: Promise-based HTTP client
- **Tailwind CSS 3.4.1**: Utility-first CSS framework
- **Lucide React 0.312.0**: Modern icon library
- **TypeScript 5.3.3**: Type-safe JavaScript

### AI/LLM
- **OpenRouter API**: LLM gateway with 200+ models
- **xiaomi/mimo-v2-flash:free**: Fast LLM model for structured outputs

## Troubleshooting

### Backend Issues

**Pydantic Compilation Errors**
- Ensure you're using Python 3.11 (NOT 3.12, 3.13, or 3.14)
- Check: `python --version` should output `Python 3.11.x`

**Port 8000 Already in Use**
```bash
# Find and kill the process using port 8000
# Windows:
netstat -ano | findstr :8000
taskkill /PID <process_id> /F

# macOS/Linux:
lsof -ti:8000 | xargs kill -9
```

**OpenRouter API Errors**
- Verify your API key is set in `backend/.env`
- Check your OpenRouter account has credits
- The system will fall back to basic explanations if AI fails

### Frontend Issues

**3D Scene Not Rendering**
- Check browser console for WebGL errors
- Ensure your browser supports WebGL 2.0
- Try disabling browser hardware acceleration and re-enabling it

**Connection Refused to Backend**
- Verify backend is running on port 8000
- Check CORS settings in `backend/main.py`
- Ensure no firewall is blocking localhost connections

## Development

### Running Tests

```bash
# Backend
cd vizarch/backend
pytest

# Frontend
cd vizarch/frontend
npm test
```

### Building for Production

```bash
# Backend
cd vizarch/backend
# Use a production ASGI server like gunicorn

# Frontend
cd vizarch/frontend
npm run build
npm start
```

## Project Structure

```
vizarch/
├── backend/
│   ├── main.py              # FastAPI application entry point
│   ├── models.py            # Pydantic models for validation
│   ├── ai_service.py        # OpenRouter AI integration
│   ├── requirements.txt     # Python dependencies
│   ├── .env                 # Environment variables (API keys)
│   └── venv/                # Virtual environment
├── frontend/
│   ├── app/
│   │   ├── page.tsx         # Main application page
│   │   ├── layout.tsx       # Root layout component
│   │   └── globals.css      # Global Jarvis-style CSS
│   ├── components/
│   │   ├── 3d/
│   │   │   ├── LabScene.tsx        # Main 3D canvas
│   │   │   ├── Node.tsx            # 3D component representation
│   │   │   └── ConnectionLine.tsx  # Connection visualization
│   │   └── ui/
│   │       ├── ComponentPalette.tsx  # Component selection UI
│   │       ├── ControlPanel.tsx      # Simulation controls
│   │       └── ResultsPanel.tsx      # Results display
│   ├── store/
│   │   └── labStore.ts      # Zustand state management
│   ├── services/
│   │   └── api.ts           # Backend API client
│   ├── types/
│   │   └── infrastructure.ts # TypeScript type definitions
│   ├── package.json         # Node dependencies
│   ├── tsconfig.json        # TypeScript configuration
│   ├── tailwind.config.js   # Tailwind CSS configuration
│   └── next.config.js       # Next.js configuration
├── README.md                # This file
└── ARCHITECTURE.md          # Detailed architecture documentation
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Built with modern web technologies and AI integration
- Special thanks to the FastAPI, Next.js, and Three.js communities

## Recent Enhancements (January 2026)

✅ **Component Tooltips**: Hover over components to see description, estimated cost, and latency
✅ **Component Search**: Filter components by name/type with real-time search
✅ **Results History**: Last 5 simulations saved and restorable
✅ **Keyboard Shortcuts**: Space (simulate), Delete (remove), Escape (deselect)
✅ **Status Bar**: Real-time metrics (component count, connections, estimated cost)
✅ **Component Templates**: 4 pre-built architectures with one-click deployment
✅ **Color-Coded Metrics**: Green/yellow/red latency indicators
✅ **Animated UI**: Spring physics, progress bars, pulse effects
✅ **Professional PDFs**: Export proposals with cost breakdowns and AI analysis

## Future Enhancements

- [ ] Undo/Redo functionality (Ctrl+Z/Y)
- [ ] Save/load infrastructure templates to backend
- [ ] Real AWS cost API integration
- [ ] Network topology validation and best practices
- [ ] Export infrastructure as Terraform/CloudFormation
- [ ] Collaborative editing with WebSocket
- [ ] Mobile/touch optimization
- [ ] Performance profiling and bottleneck detection
- [ ] Multi-region deployment support
