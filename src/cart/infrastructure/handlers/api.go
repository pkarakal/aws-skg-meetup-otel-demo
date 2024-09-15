package handlers

import (
	"encoding/json"
	"errors"
	"go.opentelemetry.io/otel/codes"
	"net/http"

	"github.com/pkarakal/aws-skg-meetup-otel-demo/src/cart/application"
	"github.com/pkarakal/aws-skg-meetup-otel-demo/src/cart/model"
	"github.com/pkarakal/aws-skg-meetup-otel-demo/src/cart/telemetry"
	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/trace"
	"go.uber.org/zap"
)

type CartHandler struct {
	cartService *application.CartService

	logger *zap.Logger
	tracer trace.Tracer
	meter  metric.Meter
}

func NewCartHandler(service *application.CartService, logger *zap.Logger, tp telemetry.Provider) *CartHandler {
	if logger == nil {
		logger = zap.NewNop()
	}

	return &CartHandler{
		cartService: service,
		logger:      logger,
		tracer:      tp.Tracer().Tracer("cart.handler"),
		meter:       tp.Meter().Meter("cart.handler"),
	}
}

func (h *CartHandler) AddToCart(w http.ResponseWriter, r *http.Request) {
	childCtx, span := h.tracer.Start(r.Context(), "AddToCart")
	defer span.End()
	var item model.CartItem
	w.Header().Add("Content-Type", "application/json")
	if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
		h.logger.Error("Failed to parse item body", zap.Error(err), zap.Any("body", r.Body))
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	cartID := r.PathValue("id")
	cart, err := h.cartService.AddItem(childCtx, cartID, item)
	if err != nil {
		h.logger.Error("Failed to add item to cart ", zap.String("id", cartID), zap.Error(err))
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	span.SetStatus(codes.Ok, "Successfully updated the cart")
	json.NewEncoder(w).Encode(cart)
}

func (h *CartHandler) GetCart(w http.ResponseWriter, r *http.Request) {
	childCtx, span := h.tracer.Start(r.Context(), "GetCart")
	defer span.End()
	cartID := r.PathValue("id")
	w.Header().Add("Content-Type", "application/json")
	cart, err := h.cartService.GetCart(childCtx, cartID)
	if err != nil {
		if errors.Is(err, application.CartNotFound) {
			h.logger.Error("Failed to find cart ", zap.String("id", cartID), zap.Error(err))
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}
		h.logger.Error("An error occurred when trying to find the cart", zap.String("id", cartID), zap.Error(err))
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	span.SetStatus(codes.Ok, "Successfully retrieved the cart")
	json.NewEncoder(w).Encode(cart)
}

func (h *CartHandler) EmptyCart(w http.ResponseWriter, r *http.Request) {
	childCtx, span := h.tracer.Start(r.Context(), "EmptyCart")
	defer span.End()
	cartID := r.PathValue("id")
	w.Header().Add("Content-Type", "application/json")
	cart, err := h.cartService.EmptyCart(childCtx, cartID)
	if err != nil {
		h.logger.Error("Failed to empty cart", zap.String("id", cartID), zap.Error(err))
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	span.SetStatus(codes.Ok, "Successfully emptied the cart")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(cart)
}

func (h *CartHandler) CreateCart(w http.ResponseWriter, r *http.Request) {
	childCtx, span := h.tracer.Start(r.Context(), "CreateCart")
	defer span.End()
	w.Header().Set("Content-Type", "application/json")

	cart, err := h.cartService.NewCart(childCtx)
	if err != nil {
		h.logger.Error("Failed to create a new cart", zap.Error(err))
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	msg, _ := json.Marshal(cart)
	span.SetStatus(codes.Ok, "Successfully created a new cart")
	w.WriteHeader(http.StatusCreated)
	w.Write(msg)
}
