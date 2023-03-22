FROM node:18.15.0-alpine3.17
ENV NODE_ENV=development
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin
ARG PORT
WORKDIR /home/node/app

# Rather than copying the entire working directory, we are only copying the package*.json files.
# This allows us to take advantage of cached Docker layers.
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
RUN npm ci --omit=dev

# Bundle app source
COPY . .

ENV PORT $PORT
EXPOSE $PORT

USER node

# Docker init will have to handle signals
ENTRYPOINT [ "node" ]
CMD [ "dist/index.js" ]
