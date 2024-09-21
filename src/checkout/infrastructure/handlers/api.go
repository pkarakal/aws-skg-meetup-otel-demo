package handlers

import (
	"encoding/json"
	"github.com/pkarakal/aws-skg-meetup-otel-demo/src/checkout/application"
	"github.com/pkarakal/aws-skg-meetup-otel-demo/src/checkout/models"
	"github.com/pkarakal/aws-skg-meetup-otel-demo/src/checkout/telemetry"
	"go.opentelemetry.io/otel/codes"
	"net/http"
	"strconv"

	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/trace"
	"go.uber.org/zap"
)

type CheckoutHandler struct {
	checkoutService *application.CheckoutService

	logger *zap.Logger
	tracer trace.Tracer
	meter  metric.Meter
}

func NewCheckoutHandler(service *application.CheckoutService, logger *zap.Logger, tp telemetry.Provider) *CheckoutHandler {
	if logger == nil {
		logger = zap.NewNop()
	}

	return &CheckoutHandler{
		checkoutService: service,
		logger:          logger,
		tracer:          tp.Tracer().Tracer("cart.handler"),
		meter:           tp.Meter().Meter("cart.handler"),
	}
}

func (h *CheckoutHandler) PlaceOrder(w http.ResponseWriter, r *http.Request) {
	childCtx, span := h.tracer.Start(r.Context(), "PlaceOrder")
	defer span.End()
	var item models.PlaceOrderRequest
	w.Header().Add("Content-Type", "application/json")
	if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
		h.logger.Error("Failed to parse item body", zap.Error(err), zap.Any("body", r.Body))
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	cartID, err := strconv.ParseInt(r.PathValue("cartId"), 10, 64)
	if err != nil {
		h.logger.Error("Failed to parse cart id", zap.Error(err))
	}
	err = h.checkoutService.PlaceOrder(childCtx, cartID, &item)
	if err != nil {
		h.logger.Error("Failed to place order ", zap.Int64("id", cartID), zap.Error(err))
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
	span.SetStatus(codes.Ok, "Successfully placed Order")
}
