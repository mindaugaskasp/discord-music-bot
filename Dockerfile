FROM ubuntu:16.04
MAINTAINER Mindaugas K. <kasp.mindaugas@gmail.com>

# Add dependencies
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y curl git git-core && \
    curl -sL https://deb.nodesource.com/setup_7.x | bash && \
    apt-get update && \
    apt-get install -y build-essential ffmpeg nodejs python && \
    apt-get autoremove -y

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install