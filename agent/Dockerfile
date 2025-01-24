FROM python:3.12-slim

WORKDIR /app

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

COPY requirements.txt .

COPY .env.local .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "main.py", "start"]
