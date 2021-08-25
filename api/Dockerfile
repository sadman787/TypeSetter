FROM node:11.2.0-stretch

RUN mkdir /opt/typesetter
WORKDIR /opt/typesetter

USER node

# Depending if node_modules is mounted into host or not, this could be useless
# ADD package.json /opt/typesetter
# RUN npm install -s

ENV PATH "$PATH:/opt/typesetter/node_modules/.bin"

CMD [ "nodemon", "/opt/typesetter/api.js" ]
