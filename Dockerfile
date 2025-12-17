# Build stage
FROM node:22-alpine AS build
WORKDIR /app

# Umami analytics configuration (passed as build args)
ARG VITE_UMAMI_ENABLED=false
ARG VITE_UMAMI_WEBSITE_ID
ARG VITE_UMAMI_SCRIPT_URL

COPY package*.json ./
RUN npm install --ignore-scripts
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
