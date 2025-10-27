# Gemini Live API Playground

This project is an interactive playground that demonstrates the capabilities of Google's Gemini Live API, allowing users to experiment with the API directly in their browser. It's built on top of LiveKit Agents.

![Gemini Live API playground preview](./web/public/playground-preview.gif)

## Repository Structure

### /agent

This directory contains the agent implementation in build on the LiveKit [Python Agents framework](https://github.com/livekit/agents).

### /web

This directory houses the web frontend, built with Next.js.

## Prerequisites

- Python 3.9 or higher
- pip (Python package installer)
- LiveKit Cloud or self-hosted LiveKit server

## Getting Started

### Env Setup

1. Copy the sample environment file: `cp .env.sample .env.local`
2. Open `.env.local` in a text editor and enter your LiveKit credentials

### Agent Setup

1. Navigate to the `/agent` directory
2. Create a virtual environment: `python -m venv .venv`
3. Activate the virtual environment:
   - On macOS and Linux: `source .venv/bin/activate`
   - On Windows: `.venv\Scripts\activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Run the agent in development mode: `python main.py dev`

### Web Frontend Setup

1. Navigate to the `/web` directory
2. Install dependencies: `pnpm install`
3. Run the development server: `pnpm dev`
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

The agent can be deployed in a variety of ways: [Deployment & Scaling Guide](https://docs.livekit.io/agents/deployment/)

The web frontend can be deployed using your preferred Next.js hosting solution, such as [Vercel](https://vercel.com/).

## Troubleshooting

Ensure the following:

- Both web and agent are running
- Environment variables are set up correctly
- Correct versions of Python and pnpm are installed

## Additional Resources

For more information or support, please refer to [LiveKit docs](https://docs.livekit.io/).

## License

Apache 2.0
