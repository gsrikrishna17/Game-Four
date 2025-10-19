package main

import (
	"context"
	"encoding/json"
	"log"

	"github.com/segmentio/kafka-go"
)

var kafkaWriter *kafka.Writer

func init() {
	kafkaWriter = kafka.NewWriter(kafka.WriterConfig{
		Brokers:   []string{"localhost:9092"},
		Topic:     "game-events",
		Balancer:  &kafka.LeastBytes{},
	})
}

type GameEvent struct {
	EventType string `json:"event_type"`
	GameID    string `json:"game_id"`
	Player1   string `json:"player1"`
	Player2   string `json:"player2"`
	Winner    string `json:"winner"`
	Duration  int    `json:"duration"`
	Timestamp int64  `json:"timestamp"`
}

func logGameEvent(game *Game, eventType string) {
	event := GameEvent{
		EventType: eventType,
		GameID:    game.ID,
		Player1:   game.Player1.Username,
		Player2:   game.Player2.Username,
		Winner:    "",
		Timestamp: time.Now().Unix(),
	}

	if game.Winner == 1 {
		event.Winner = game.Player1.Username
	} else if game.Winner == 2 {
		event.Winner = game.Player2.Username
	}

	eventJSON, _ := json.Marshal(event)

	err := kafkaWriter.WriteMessages(context.Background(),
		kafka.Message{
			Key:   []byte(game.ID),
			Value: eventJSON,
		},
	)

	if err != nil {
		log.Println("Kafka write error:", err)
	}
}

func closeKafka() {
	if err := kafkaWriter.Close(); err != nil {
		log.Println("Failed to close kafka writer:", err)
	}
}
