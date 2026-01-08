# Stage 1: Build React Frontend
FROM node:18-alpine AS build-stage
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Setup Node Backend
FROM node:18-alpine AS production-stage
WORKDIR /app
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install --production
COPY server/ ./

# Copy built frontend assets to server
COPY --from=build-stage /app/client/dist ./public

# Final setup
EXPOSE 3000
ENV PORT=3000
ENV NODE_ENV=production

CMD ["node", "index.js"]
