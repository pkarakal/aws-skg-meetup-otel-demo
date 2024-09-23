terraform {
  required_version = ">= 1.7.4"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.68.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.12.1"
    }
    kubectl = {
      source  = "alekc/kubectl"
      version = "~> 2.0.4"
    }
  }

  backend "s3" {
    bucket         = "otel-demo-pkarakal"
    key            = "otel-demo.tfstate"
    encrypt        = true
  }
}