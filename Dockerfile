FROM ubuntu:16.04
MAINTAINER Mindaugas K. <kasp.mindaugas@gmail.com>

# Add dependencies
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y git git-core curl && \
    curl -sL https://deb.nodesource.com/setup_7.x | bash && \
    apt-get update && \
    apt-get install -y build-essential ffmpeg nodejs python && \
    apt-get autoremove -y

# Create app directory
WORKDIR /usr/src/app

# Bundle app source
COPY . .

RUN npm install

CMD [ "npm", "run", "prod"]