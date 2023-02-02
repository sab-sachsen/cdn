FROM node:16.17.0-slim

WORKDIR /app

COPY . .
RUN npm ci
RUN npm run build

ENV PORT 8080
CMD ["node", "server.js"]

EXPOSE 8080
