package rabbitmq

import amqp "github.com/rabbitmq/amqp091-go"

type amqpHeadersCarrier struct {
	headers amqp.Table
}

// Get retrieves a single value for a key.
func (c amqpHeadersCarrier) Get(key string) string {
	if val, ok := c.headers[key].(string); ok {
		return val
	}
	return ""
}

// Set sets a single key-value pair.
func (c amqpHeadersCarrier) Set(key string, value string) {
	c.headers[key] = value
}

// Keys lists all the keys stored in this carrier.
func (c amqpHeadersCarrier) Keys() []string {
	keys := make([]string, 0, len(c.headers))
	for k := range c.headers {
		keys = append(keys, k)
	}
	return keys
}
