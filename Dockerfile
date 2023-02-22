FROM node:16.17.0-slim

WORKDIR /app

COPY . .
RUN npm ci
RUN npm install -g pm2
RUN npm run build

ENV PORT 8080
CMD ["pm2-runtime", "dist/server.js"]

EXPOSE 8080
