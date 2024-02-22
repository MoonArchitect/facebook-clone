FROM golang:1.22.0-bookworm
VOLUME /src

COPY ./go.mod ./go.mod
COPY ./go.sum ./go.sum
RUN go mod download

USER root

WORKDIR /src
EXPOSE 8080
CMD cfg=local.yml go run bin/main_api/main.go