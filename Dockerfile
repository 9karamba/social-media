FROM node:20-alpine

WORKDIR /usr/local/app

COPY src/back ./

RUN yarn install && yarn cache clean --force
RUN mkdir -p build
RUN yarn build

RUN rm -rf src

EXPOSE 8083

CMD ["node", "build/server.js"]