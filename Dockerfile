FROM node:20-alpine AS base

# Install system dependencies including ffmpeg for video processing and python3/pymupdf for PDF parsing
RUN apk add --no-cache ffmpeg python3 py3-pip fontconfig ttf-dejavu

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install Node dependencies
RUN npm ci

# Copy full application code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js application
RUN npm run build

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["npm", "run", "start"]
