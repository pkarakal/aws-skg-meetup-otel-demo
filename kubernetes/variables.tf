variable "region" {
  type        = string
  description = "Region to deploy the Infrastructure"
  default     = "eu-west-1"
}

variable "name" {
  type = string
  description = "The VPC name"
  default = "VPC"
}

variable "service_repositories" {
  type = list(object({
    name = string
  }))
  description = "The name of the services"
  default = [
    {
      name = "cart"
    },
    {
      name = "catalog"
    },
    {
      name="checkout"
    },
    {
      name = "frontend"
    }
  ]
}

variable "cidr" {
  type        = string
  description = "VPC IPv4 CIDR block"
  default     = "10.10.0.0/16"
}

variable "public_subnets_cidr_blocks" {
  description = "List of VPC public subnets CIDR blocks"
  type        = list(string)
  default     = ["10.10.1.0/24", "10.10.2.0/24", "10.10.3.0/24"]
}

variable "private_subnets_cidr_blocks" {
  description = "List of VPC private subnets CIDR blocks"
  type        = list(string)
  default     = ["10.10.4.0/24", "10.10.5.0/24", "10.10.6.0/24"]
}
