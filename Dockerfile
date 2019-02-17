FROM ubuntu:18.04
MAINTAINER Mindaugas K. <kasp.mindaugas@gmail.com>

# Add dependencies
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y git git-core curl && \
    apt-get install -y nodejs && \
    apt-get install -y npm && \
    apt-get install -y build-essential ffmpeg python && \
    apt-get autoremove -y

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN npm install

CMD [ "npm", "run", "prod"]