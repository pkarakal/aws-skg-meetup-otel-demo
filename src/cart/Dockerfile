FROM golang:1.25 as build

WORKDIR /app
COPY go.mod go.sum ./
RUN --mount=type=cache,target=/go/pkg/mod/ go mod download

COPY . .
RUN CGO_ENABLED=0 go build -ldflags "-s -w" -o cart

FROM gcr.io/distroless/static-debian13 as final
COPY --from=build /app/cart /

EXPOSE 8081
ENTRYPOINT ["/cart"]
