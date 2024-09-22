FROM golang:1.23 as build

WORKDIR /app
COPY go.mod go.sum ./
RUN --mount=type=cache,target=/go/pkg/mod/ go mod download

COPY . .
RUN CGO_ENABLED=0 go build -ldflags "-s -w" -o cart

FROM gcr.io/distroless/static-debian12 as final
COPY --from=build /app/cart /

EXPOSE 8081
ENTRYPOINT ["/cart"]
