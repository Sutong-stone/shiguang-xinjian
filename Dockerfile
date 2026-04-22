FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
ENV HTTP_PROXY=http://172.23.0.4:2003
ENV HTTPS_PROXY=http://172.23.0.4:2003
ENV http_proxy=http://172.23.0.4:2003
ENV https_p