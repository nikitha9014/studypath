# StudyPath — single-service image for AWS App Runner
# Build frontend, then run Express (serves API + static UI) on port 4000

FROM node:22-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM node:22-alpine
WORKDIR /app

COPY backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev

COPY backend/ ./backend/
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

ENV PORT=4000
ENV NODE_ENV=production
EXPOSE 4000

WORKDIR /app/backend
CMD ["node", "server.js"]
