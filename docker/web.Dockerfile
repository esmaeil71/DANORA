FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/frontend/package.json apps/frontend/
RUN npm ci -w @danora/frontend

FROM base AS build
WORKDIR /app
ARG VITE_API_URL=http://localhost:4000
ENV VITE_API_URL=$VITE_API_URL
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/frontend/node_modules ./apps/frontend/node_modules
COPY . .
RUN npm run build -w @danora/frontend

FROM nginx:alpine AS runner
COPY docker/frontend-spa.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/frontend/dist /usr/share/nginx/html
EXPOSE 3000