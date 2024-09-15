package router

import (
	"net/http"

	"github.com/pkarakal/aws-skg-meetup-otel-demo/src/cart/infrastructure/handlers"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
)

func InitRouter(s *handlers.CartHandler) http.Handler {
	router := http.NewServeMux()
	initRoutes(router, s)
	var handler http.Handler = router
	handler = otelhttp.NewHandler(handler, "cart")
	return handler
}

func initRoutes(mux *http.ServeMux, s *handlers.CartHandler) {
	mux.HandleFunc("POST /api/v1/cart", s.CreateCart)
	mux.HandleFunc("GET /api/v1/cart/{id}", s.GetCart)
	mux.HandleFunc("POST /api/v1/cart/{id}", s.AddToCart)
	mux.HandleFunc("POST /api/v1/cart/{id}/empty", s.EmptyCart)
	mux.Handle("/", http.NotFoundHandler())
}
