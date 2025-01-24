FROM python:3.10-alpine

WORKDIR /app

RUN apk add --no-cache \
    git \
    curl \
    bash \
    gcc \
    musl-dev \
    libffi-dev \
    openssl-dev \
    make

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "main.py", "run"]
