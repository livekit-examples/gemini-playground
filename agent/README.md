# Agent Deployment

This directory contains a LiveKit Agent that can be deployed to LiveKit Cloud using GitHub Actions CI/CD.

## Prerequisites

1. **LiveKit Cloud Account**: Sign up at [cloud.livekit.io](https://cloud.livekit.io)
2. **Google AI API Key**: Get from [Google AI Studio](https://aistudio.google.com/apikey)
3. **GitHub Repository**: Your code must be in a GitHub repository

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
GOOGLE_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here
LIVEKIT_URL=your_livekit_url
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
```

### Run Locally

```bash
python main.py start
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
   
   Go to your GitHub repository → Settings → Secrets and variables → Actions
   
   **Add the following secrets:**

   - `LIVEKIT_PROJECT_NAME`: Your LiveKit Cloud project name (subdomain)
   - `LIVEKIT_URL`: Your LiveKit Cloud URL (e.g., `wss://your-project.livekit.cloud`)
   - `LIVEKIT_API_KEY`: Your LiveKit API key
   - `LIVEKIT_API_SECRET`: Your LiveKit API secret

   **Add the following environment variable:**
   
   Go to Settings → Secrets and variables → Actions → Variables tab
   
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

### How It Works

The CI/CD workflow:

1. **Installs LiveKit CLI** in the GitHub Actions runner
2. **Authenticates** with LiveKit Cloud using your secrets
3. **Creates `livekit.toml`** automatically from environment variables
4. **Deploys the agent** with `lk agent deploy`
5. **Builds a Docker image** from your `Dockerfile`
6. **Deploys to LiveKit Cloud** using rolling deployment

Note: `livekit.toml` is auto-generated in CI/CD and gitignored. Keep your local copy for development.

### Manual Deployment

To trigger a deployment manually:

1. Go to your GitHub repository
2. Click "Actions" tab
3. Select "Deploy Agent to LiveKit Cloud" workflow
4. Click "Run workflow" button
5. Select the branch and click "Run workflow"

### Monitoring

After deployment:

- View logs: `lk agent logs`
- Check status: `lk agent status`
- View in dashboard: [cloud.livekit.io/projects/p_/agents](https://cloud.livekit.io/projects/p_/agents)

### Rollback

To rollback to a previous version:

```bash
lk agent rollback
```

Or specify a version:

```bash
lk agent versions  # List available versions
lk agent rollback --version <version-id>
```

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

## Troubleshooting

### Build Fails

- Check that your `Dockerfile` is valid
- Ensure all dependencies are in `requirements.txt`
- View build logs: `lk agent logs --log-type build`

### Agent Crashes

- Check deploy logs: `lk agent logs --log-type deploy`
- Verify all required secrets are set
- Test locally first with `.env.local`

### Secrets Not Working

- Ensure secrets are set in GitHub repository settings
- Secret names must match exactly (case-sensitive)
- Re-deploy after updating secrets

## Resources

- [LiveKit Agents Documentation](https://docs.livekit.io/agents/)
- [LiveKit Cloud Deployment Guide](https://docs.livekit.io/agents/ops/deployment/)
- [LiveKit CLI Reference](https://docs.livekit.io/agents/ops/deployment/cli/)

