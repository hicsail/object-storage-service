FROM node:18-alpine AS signlab

# Copy over the source
WORKDIR /usr/src/cargo
COPY . .

# Install required packages and build for prod
RUN apk update && \
    npm install && \
    npm run build

EXPOSE 3000

CMD npm run start:prod
