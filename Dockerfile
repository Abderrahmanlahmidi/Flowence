FROM node:24-bullseye


WORKDIR /app


COPY package*.json ./


RUN npm install


COPY . .


EXPOSE 7000

CMD ["npm", "start"]



