FROM node:15.10-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY . .
RUN npm install -g pm2
RUN npm install --production --silent && mv node_modules ../
EXPOSE 3000
CMD ["npm", "start"]
