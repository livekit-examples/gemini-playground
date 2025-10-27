FROM python:3.12-slim

WORKDIR /app

# Install system dependencies and uv
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    bash \
    gcc \
    g++ \
    build-essential \
    libffi-dev \
    libssl-dev \
    make \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Copy dependency files
COPY pyproject.toml .

# Install dependencies with uv
RUN uv pip install --system --no-cache -r pyproject.toml

COPY . .

CMD ["python", "main.py", "start"]
