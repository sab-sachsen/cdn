FROM node:18.15.0-alpine3.17
ENV NODE_ENV=production
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin
ARG PORT
WORKDIR /home/node/app

# Bundle app source
COPY dist/ .

ENV PORT $PORT
EXPOSE $PORT

USER node

# Docker init will have to handle signals
ENTRYPOINT [ "node" ]
CMD [ "index.js" ]
