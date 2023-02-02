FROM node:16.17.0-slim

WORKDIR /app

COPY . .
RUN npm install

ENV PORT 8080
CMD ["node", "server.js"]

EXPOSE 8080
