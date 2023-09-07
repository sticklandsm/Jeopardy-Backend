FROM node:18
# Create app directory
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
RUN npm ci --omit=dev
# Bundle app source
COPY . .
EXPOSE 8999
CMD [ "node", "./dist/server/server/server.js" ]
