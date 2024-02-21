package config

import (
	"fmt"
	"os"

	"gopkg.in/yaml.v3"
)

var Cfg ConfigType

type ConfigType struct {
	Env string `yaml:"env"`
	DB  struct {
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
	Aws struct {
		S3 string `yaml:"s3"`
	} `yaml:"aws"`
}

const configEnvKey = "cfg"

func ParseConfig() error {
	configPath := os.Getenv(configEnvKey)
	if configPath == "" {
		return fmt.Errorf("config path is not provided")
	}

	raw, err := os.Open(configPath)
	if err != nil {
		return err
	}

	var newCfg ConfigType
	dec := yaml.NewDecoder(raw)
	dec.KnownFields(true)
	err = dec.Decode(&newCfg)
	// TODO: still nede to make sure all config values are present, find better config solution
	if err != nil {
		return err
	}

	Cfg = newCfg
	return nil
}
