FROM golang:1.22.0-bookworm

VOLUME /src

COPY ./go.mod ./go.mod
COPY ./go.sum ./go.sum
RUN go mod download
RUN go install github.com/bokwoon95/wgo@latest

USER root

WORKDIR /src
EXPOSE 8081
CMD cfg=local.yml wgo run bin/chat_api/main.go