package config

import (
	"os"

	"gopkg.in/yaml.v3"
)

var Cfg ConfigType

type ConfigType struct {
	DB struct {
		PostgresURL    string `yaml:"postgresURL"`
		MaxConnections int32  `yaml:"maxConnections"`
	} `yaml:"db"`
	Server struct {
		Port                int `yaml:"port"`
		ReadTimeoutSeconds  int `yaml:"readTimeoutSeconds"`
		WriteTimeoutSeconds int `yaml:"writeTimeoutSeconds"`
		MaxHeaderBytes      int `yaml:"maxHeaderBytes"`
	} `yaml:"server"`
	Auth struct {
		CookieDomain    string `yaml:"cookieDomain"`
		MaxAgeSeconds   int    `yaml:"maxAgeSeconds"`
		RSAKeyFile      string `yaml:"rsaKeyFile"`
		Argon2Time      uint32 `yaml:"argon2Time"`
		Argon2Memory    uint32 `yaml:"argon2Memory"`
		Argon2Threads   uint8  `yaml:"argon2Threads"`
		Argon2KeyLength uint32 `yaml:"argon2KeyLength"`
	} `yaml:"auth"`
}

const configEnvKey = "cfg"

func ParseConfig() error {
	configPath := os.Getenv(configEnvKey)
	raw, err := os.ReadFile(configPath)
	if err != nil {
		return err
	}

	var newCfg ConfigType
	err = yaml.Unmarshal(raw, &newCfg)
	if err != nil {
		return err
	}

	Cfg = newCfg
	return nil
}
