FROM mhart/alpine-node:7.6

COPY ./signalServer.js /signalServer.js
WORKDIR /

RUN ["npm", "install", "ws"]
CMD ["node", "./signalServer.js"]

EXPOSE 3000

