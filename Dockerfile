FROM node:15.12.0-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY ./package.json ./package.json
COPY . .
RUN npm install -g pm2
RUN npm install --production --silent
EXPOSE 3000
CMD ["npm", "start"]
