FROM mhart/alpine-node:7.6

COPY . /
WORKDIR /

RUN ["npm", "install"]
RUN ["node", "./node_modules/gulp/bin/gulp.js", "build"]

CMD ["sh", "/compose/chat/start.sh"]


EXPOSE 8000

