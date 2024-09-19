package com.pkarakal.catalog.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {
    @Bean
    public TopicExchange inventoryUpdateExchange() {
        return new TopicExchange("inventory_update");
    }

    // Declare the inventory update queue
    @Bean
    public Queue inventoryUpdateQueue() {
        return QueueBuilder.durable("inventory_update")
                .withArgument("x-dead-letter-exchange", "inventory_update_dlx") // Specify DLX
                .withArgument("x-dead-letter-routing-key", "inventory_update_dlq") // Routing key for DLQ
                .build();
    }

    @Bean
    public Binding inventoryUpdateBinding() {
        return BindingBuilder.bind(inventoryUpdateQueue()).to(inventoryUpdateExchange()).with("order.placed");
    }

    // Declare the dead letter exchange
    @Bean
    public DirectExchange deadLetterExchange() {
        return new DirectExchange("inventory_update_dlx");
    }

    // Declare the dead letter queue
    @Bean
    public Queue deadLetterQueue() {
        return QueueBuilder.durable("inventory_update_dlq").build();
    }

    // Bind the DLQ to the dead letter exchange
    @Bean
    public Binding dlqBinding() {
        return BindingBuilder.bind(deadLetterQueue()).to(deadLetterExchange()).with("inventory_update_dlq");
    }

    @Bean
    public Jackson2JsonMessageConverter jackson2JsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate configureRabbitTemplate(ConnectionFactory connectionFactory, Jackson2JsonMessageConverter converter) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(converter);
        return rabbitTemplate;
    }
}
