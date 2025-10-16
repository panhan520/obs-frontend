# Stage 1: Build the application
ARG NODE_ENV=production

FROM node:18-alpine AS build
WORKDIR /app

ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}

COPY package*.json ./
RUN npm install
COPY . .

RUN npm run build -- --mode ${NODE_ENV}

# Stage 2: Serve the application with Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 