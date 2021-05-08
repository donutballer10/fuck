FROM node:14.16.0-buster

ENV HOME /root

WORKDIR /root

COPY . .

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.2.1/wait /wait
RUN chmod +x /wait

RUN npm install monk && \npm install bcrypt && \npm install express && \npm install socket.io

EXPOSE 8000

WORKDIR backend/


CMD /wait && node server.js && node database.js
