FROM golang:1.22.0-bookworm
RUN apt update
RUN apt install libvips42 libvips-dev

VOLUME /src

COPY ./go.mod ./go.mod
COPY ./go.sum ./go.sum
RUN go mod download
RUN go install github.com/bokwoon95/wgo@latest

USER root

WORKDIR /src
EXPOSE 8080
CMD cfg=local.yml wgo run bin/main_api/main.go