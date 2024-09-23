resource "aws_iam_role" "catalog" {
  name = "CatalogRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRoleWithWebIdentity"
        Effect = "Allow"
        Principal = {
          Federated = module.eks.oidc_provider_arn
        }
        Condition = {
          StringEquals = {
            "${module.eks.oidc_provider}:aud" =  "sts.amazonaws.com",
          }
          StringLike = {
            "${module.eks.oidc_provider}:sub" = "system:serviceaccount:*:*"
          }
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "runner_policy" {
  name = "CatalogServiceS3Policy"
  role = aws_iam_role.catalog.id

  policy = data.aws_iam_policy_document.catalog_policy.json
}


resource "aws_iam_policy" "alb_controller_policy" {
  name = "AWSLoadBalancerControllerIAMPolicy"

  policy = data.aws_iam_policy_document.alb_controller_role_policy.json
}

resource "aws_iam_role" "alb_controller_role" {
  name = "AmazonEKSLoadBalancerControllerRole"
  assume_role_policy = data.aws_iam_policy_document.alb_controller_role_assume_policy.json

  managed_policy_arns = [
    aws_iam_policy.alb_controller_policy.arn
  ]
}

resource "aws_iam_role" "ebs_csi_role" {
  name = "AmazonEKS_EBS_CSI_DriverRole"

  assume_role_policy = data.aws_iam_policy_document.ebs_csi_role_assume_policy.json

  managed_policy_arns = [
    "arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy"
  ]
}
