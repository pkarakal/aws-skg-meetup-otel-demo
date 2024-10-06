# VPC
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.5.3"

  name = var.name
  cidr = var.cidr

  azs = slice(data.aws_availability_zones.available_azs.names, 0, 3)

  private_subnets = var.private_subnets_cidr_blocks
  public_subnets  = var.public_subnets_cidr_blocks

  enable_nat_gateway   = true
  single_nat_gateway   = true
  enable_dns_hostnames = true

  private_subnet_tags = {
    "kubernetes.io/cluster/aws-skg-user-group-otel-demo" = 1
    "karpenter.sh/discovery"          = "aws-skg-user-group-otel-demo"
  }

  public_subnet_tags = {
    "kubernetes.io/role/elb" = 1
  }

  # karpenter searches for security groups with this tag and assigns them to the nodes
  default_security_group_tags = {
    "karpenter.sh/discovery" = "${replace(basename(path.cwd), "_", "-")}-cluster"
  }

  tags = {
    Component = "General Infrastructure"
  }
}