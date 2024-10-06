# VPC Endpoints
module "endpoints" {
  source  = "terraform-aws-modules/vpc/aws//modules/vpc-endpoints"
  version = "~> 5.5.3"

  vpc_id = module.vpc.vpc_id

  create_security_group      = true
  security_group_name_prefix = "otel-temo"
  security_group_description = "OTEL Demo VPC Endpoint SG"
  security_group_rules = {
    ingress_https = {
      cidr_blocks = [module.vpc.vpc_cidr_block]
    }
  }

  endpoints = {
    ecr_api = {
      service             = "ecr.api"
      private_dns_enabled = true
      subnet_ids          = module.vpc.private_subnets
      policy              = data.aws_iam_policy_document.generic_endpoint_policy.json
    },
    ecr_dkr = {
      service             = "ecr.dkr"
      private_dns_enabled = true
      subnet_ids          = module.vpc.private_subnets
      policy              = data.aws_iam_policy_document.generic_endpoint_policy.json
    },
    s3 = {
      service         = "s3"
      service_type    = "Gateway"
      route_table_ids = module.vpc.private_route_table_ids
      policy          = data.aws_iam_policy_document.s3_endpoint_policy.json
    }
  }

  tags = {
    Component    = "General Infrastructure"
  }
}