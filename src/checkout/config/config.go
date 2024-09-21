package config

import (
	"fmt"
	"os"
	"strings"

	"github.com/pkarakal/aws-skg-meetup-otel-demo/src/checkout/telemetry"
	"github.com/spf13/viper"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

var DefaultConfigDirs = []string{
	".",
	"/",
	"./config",
	"/etc/checkout",
}

type Configuration struct {
	Port            uint64          `mapstructure:"port"`
	CartConfig      ClientOptions   `mapstructure:"cart"`
	CatalogConfig   ClientOptions   `mapstructure:"catalog"`
	RabbitMQConfig  RabbitMQOptions `mapstructure:"rabbitmq"`
	TelemetryConfig TelemetryConfig `mapstructure:"telemetry"`
}

type ClientOptions struct {
	Timeout  int    `mapstructure:"timeout"`
	Port     int64  `mapstructure:"port"`
	Protocol string `mapstructure:"protocol"`
	Server   string `mapstructure:"server"`
	Path     string `mapstructure:"path"`
}

type RabbitMQOptions struct {
	Host     string `mapstructure:"host"`
	Port     int64  `mapstructure:"port"`
	Username string `mapstructure:"username"`
	Password string `mapstructure:"password"`
	Exchange string `mapstructure:"exchange"`
}

type TelemetryConfig struct {
	Enabled       bool    `mapstructure:"enabled"`
	CollectorURL  *string `mapstructure:"collector_url,omitempty"`
	CollectorPort *uint64 `mapstructure:"collector_port,omitempty"`
}

func SetUpEnvVarReader() {
	// read from environment variables
	viper.AutomaticEnv()

	// Replace "." with "_" when reading environment variables
	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
}

func LoadConfig() (*Configuration, error) {
	SetUpEnvVarReader()

	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	for _, dir := range DefaultConfigDirs {
		viper.AddConfigPath(dir)
	}
	err := viper.ReadInConfig()
	// It's ok if the config file doesn't exist, but we want to catch any
	// other config-related issues
	if err != nil {
		if !os.IsNotExist(err) {
			return nil, fmt.Errorf("failed to read config file %v", err)
		}

		zap.L().Info("no config file found, proceeding without one")
	}

	config := &Configuration{}

	err = viper.Unmarshal(config)
	if err != nil {
		zap.L().Error(fmt.Sprintf("Couldn't unmarshal config into struct, %v", err), zap.Error(err))
		return nil, err
	}
	return config, nil
}

func InitLogging(verbose bool) (*zap.Logger, func()) {
	atomicLevel := zap.NewAtomicLevel()
	level := zapcore.WarnLevel
	if verbose {
		level = zapcore.DebugLevel
	}
	atomicLevel.SetLevel(level)
	// initialize logger
	logger := zap.New(zapcore.NewCore(
		zapcore.NewJSONEncoder(
			zap.NewProductionEncoderConfig()),
		zapcore.Lock(os.Stdout), atomicLevel,
	))

	undo := zap.ReplaceGlobals(logger)
	return logger, undo
}

func InitTelemetry(l *zap.Logger, c *TelemetryConfig, attributes []func(*telemetry.OTELProvider)) (telemetry.Provider, error) {
	tc := telemetry.ProviderConfiguration{}
	telemetryOptions := &telemetry.Options{
		Logger: l.With(zap.String("component", "telemetry")),
	}
	l.Debug("Config", zap.Any("config", c))
	if !c.Enabled || (c.CollectorPort == nil || c.CollectorURL == nil) {
		l.Info("Telemetry is not enabled. Initializing NoOp Provider")
		return tc.NewNoOpProvider(telemetryOptions)
	}
	tc = telemetry.ProviderConfiguration{
		Port:        *c.CollectorPort,
		EndpointURL: *c.CollectorURL,
	}
	l.Debug("Initializing telemetry provider")
	return tc.NewTelemetryProvider(telemetryOptions, attributes)
}
