FROM docker:dind
RUN apk update
RUN apk add bash
RUN apk add --update nodejs npm
RUN npm install -g typescript

# npm install types
WORKDIR /types
COPY ./types/package.json ./types/package-lock.json ./
RUN npm ci
COPY ./types ./
RUN npm run prisma

# npm install backend
WORKDIR /backend
COPY ./backend/package.json ./backend/package-lock.json ./
RUN npm ci
RUN cp -r ../types/prisma .
RUN npm run prisma

COPY ./backend ./
RUN npm run build

# run
CMD ["bash", "prod.sh"]
