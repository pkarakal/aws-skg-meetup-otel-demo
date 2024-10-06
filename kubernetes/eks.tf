module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.24.2"

  cluster_name    = "aws-skg-user-group-otel-demo"
  cluster_version = "1.30"

  cluster_endpoint_public_access = true

  create_kms_key = true

  cloudwatch_log_group_retention_in_days = 7

  cluster_addons = {
    kube-proxy = {
      most_recent = true
    }

    vpc-cni = {
      most_recent = true
    }

    coredns = {
      most_recent = true
      configuration_values = jsonencode({
        computeType = "fargate"
      })
    }
  }

  vpc_id                   = module.vpc.vpc_id
  subnet_ids               = module.vpc.private_subnets
  control_plane_subnet_ids = module.vpc.private_subnets

  create_cluster_security_group              = false
  create_cluster_primary_security_group_tags = true
  create_node_security_group                 = false

  fargate_profile_defaults = {
    iam_role_additional_policies = {
      additional   = aws_iam_policy.eks_fargate_profile_policy.arn
      additional_1 = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
      additional_2 = "arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy"
    }
  }

  fargate_profiles = {
    base = {
      name = "base-fargate-profile"
      selectors = [
        { namespace = "karpenter" }
      ]

      subnet_ids = module.vpc.private_subnets
    }

    kube-system = {
      selectors = [
        { namespace = "kube-system" }
      ]
    }

    karpenter = {
      selectors = [
        { namespace = "karpenter" }
      ]

      subnet_ids = module.vpc.private_subnets
    }
  }

  tags = {
    "karpenter.sh/discovery" = "aws-skg-user-group-otel-demo"
  }

  enable_cluster_creator_admin_permissions = true

  cluster_upgrade_policy =  {
    support_type = "STANDARD"
  }
}


resource "aws_eks_addon" "eks_cluster_ebs_csi_addon" {
  cluster_name             = module.eks.cluster_name
  addon_name               = "aws-ebs-csi-driver"
  addon_version            = data.aws_eks_addon_version.ebs_csi_latest.version
  service_account_role_arn = aws_iam_role.ebs_csi_role.arn
}
