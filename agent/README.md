# Agent Deployment

This directory contains a LiveKit Agent that can be deployed to LiveKit Cloud using GitHub Actions CI/CD.

## Prerequisites

1. **LiveKit Cloud Account**: Sign up at [cloud.livekit.io](https://cloud.livekit.io)
2. **Google AI API Key**: Get from [Google AI Studio](https://aistudio.google.com/apikey)

## Local Development

### Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create `.env.local` file with your secrets:
```bash
LIVEKIT_URL=your_livekit_url
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
```

### Run Locally

```bash
python main.py dev
```

## CI/CD Deployment to LiveKit Cloud

### First-Time Setup

1. **Install LiveKit CLI** (for initial setup):
```bash
curl -sSL https://get.livekit.io/cli | bash
```

2. **Authenticate with LiveKit Cloud**:
```bash
lk cloud auth
```

3. **Set up GitHub Secrets and Environment Variables**:
   
   Go to your GitHub repository → Settings → Env → production
   
   **Add the following secrets:**

   - `LIVEKIT_PROJECT_NAME`: Your LiveKit Cloud project name (subdomain e.g. agents_c0g1)
   - `LIVEKIT_URL`: Your full LiveKit Cloud URL (e.g., `wss://your-project.livekit.cloud`)
   - `LIVEKIT_API_KEY`: Your LiveKit API key
   - `LIVEKIT_API_SECRET`: Your LiveKit API secret
   - `LIVEKIT_AGENT_ID`: Your agent ID (e.g., `CA_PARMnikDQoKU`)

   **To get LiveKit credentials:**
   - Log into [cloud.livekit.io](https://cloud.livekit.io)
   - Go to Settings → Keys
   - Create a new API key/secret pair
   
   **To get Agent ID:**
   - Create your agent locally first: `lk agent create`
   - The ID will be in the generated `livekit.toml` file

4. **Configure the workflow**:
   
   The workflow file is located at `.github/workflows/deploy-agent.yml`
   
   By default, it deploys when:
   - Code is pushed to `main` or `master` branch
   - Files in the `agent/` directory change
   - Manually triggered via GitHub Actions UI

### Monitoring

After deployment:

- View logs: `lk agent logs`
- Check status: `lk agent status`
- View in dashboard: [cloud.livekit.io/projects/p_/agents](https://cloud.livekit.io/projects/p_/agents)

## Project Structure

```
agent/
├── main.py              # Main agent code
├── requirements.txt     # Python dependencies
├── Dockerfile          # Docker build configuration
├── .dockerignore       # Files to exclude from Docker build
├── .env.local          # Local secrets (not in git)
├── livekit.toml        # Agent deployment config (keep local copy, gitignored)
└── README.md           # This file
```

## Resources

- [LiveKit Agents Documentation](https://docs.livekit.io/agents/)
- [LiveKit Cloud Deployment Guide](https://docs.livekit.io/agents/ops/deployment/)
- [LiveKit CLI Reference](https://docs.livekit.io/agents/ops/deployment/cli/)

