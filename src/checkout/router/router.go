package router

import (
	"net/http"

	"github.com/pkarakal/aws-skg-meetup-otel-demo/src/checkout/infrastructure/handlers"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
)

func InitRouter(s *handlers.CheckoutHandler) http.Handler {
	router := http.NewServeMux()
	initRoutes(router, s)
	var handler http.Handler = router
	handler = otelhttp.NewHandler(handler, "checkout")
	return handler
}

func initRoutes(mux *http.ServeMux, s *handlers.CheckoutHandler) {
	mux.HandleFunc("POST /api/v1/checkout/{cartId}", s.PlaceOrder)
	mux.Handle("/", http.NotFoundHandler())
}
