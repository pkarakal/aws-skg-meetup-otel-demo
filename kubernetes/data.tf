# Retrieve availability zones
data "aws_availability_zones" "available_azs" {
  state = "available"
}

# Get current region
data "aws_region" "current" {}

# VPCe policies
data "aws_iam_policy_document" "generic_endpoint_policy" {
  statement {
    effect    = "Allow"
    actions   = ["ecr:*"]
    resources = ["*"]

    principals {
      type        = "*"
      identifiers = ["*"]
    }
  }
}

data "aws_iam_policy_document" "s3_endpoint_policy" {
  statement {
    effect    = "Allow"
    actions   = ["s3:*"]
    resources = ["*"]

    principals {
      type        = "*"
      identifiers = ["*"]
    }
  }
}

# Auth token for HELM charts
data "aws_ecrpublic_authorization_token" "token" {
  provider = aws.virginia
}

# get current caller metadata like account id
data "aws_caller_identity" "current" {
  provider = aws
}

data "aws_iam_policy_document" "catalog_policy" {
  statement {
    effect = "Allow"
    actions = [
      "s3:*"
    ]
    resources = [
      aws_s3_bucket.catalog.arn,
      "${aws_s3_bucket.catalog.arn}/*"
    ]
  }
}

data "aws_iam_policy_document" "alb_controller_role_policy" {
  statement {
    effect = "Allow"
    actions = [
      "iam:CreateServiceLinkedRole"
    ]
    resources = ["*"]
    condition {
      test     = "StringEquals"
      values = [
        "elasticloadbalancing.amazonaws.com"
      ]
      variable = "iam:AWSServiceName"
    }
  }

  statement {
    effect = "Allow"
    actions = [
      "ec2:DescribeAccountAttributes",
      "ec2:DescribeAddresses",
      "ec2:DescribeAvailabilityZones",
      "ec2:DescribeInternetGateways",
      "ec2:DescribeVpcs",
      "ec2:DescribeVpcPeeringConnections",
      "ec2:DescribeSubnets",
      "ec2:DescribeSecurityGroups",
      "ec2:DescribeInstances",
      "ec2:DescribeNetworkInterfaces",
      "ec2:DescribeTags",
      "ec2:GetCoipPoolUsage",
      "ec2:DescribeCoipPools",
      "elasticloadbalancing:DescribeLoadBalancers",
      "elasticloadbalancing:DescribeLoadBalancerAttributes",
      "elasticloadbalancing:DescribeListeners",
      "elasticloadbalancing:DescribeListenerCertificates",
      "elasticloadbalancing:DescribeSSLPolicies",
      "elasticloadbalancing:DescribeRules",
      "elasticloadbalancing:DescribeTargetGroups",
      "elasticloadbalancing:DescribeTargetGroupAttributes",
      "elasticloadbalancing:DescribeTargetHealth",
      "elasticloadbalancing:DescribeTags",
      "elasticloadbalancing:DescribeTrustStores",
      "elasticloadbalancing:DescribeListenerAttributes"
    ]
    resources = ["*"]
  }

  statement {
    effect = "Allow"
    actions = [
      "cognito-idp:DescribeUserPoolClient",
      "acm:ListCertificates",
      "acm:DescribeCertificate",
      "iam:ListServerCertificates",
      "iam:GetServerCertificate",
      "waf-regional:GetWebACL",
      "waf-regional:GetWebACLForResource",
      "waf-regional:AssociateWebACL",
      "waf-regional:DisassociateWebACL",
      "wafv2:GetWebACL",
      "wafv2:GetWebACLForResource",
      "wafv2:AssociateWebACL",
      "wafv2:DisassociateWebACL",
      "shield:GetSubscriptionState",
      "shield:DescribeProtection",
      "shield:CreateProtection",
      "shield:DeleteProtection"
    ]
    resources = ["*"]
  }

  statement {
    effect = "Allow"
    actions = [
      "ec2:AuthorizeSecurityGroupIngress",
      "ec2:RevokeSecurityGroupIngress"
    ]
    resources = ["*"]
  }

  statement {
    effect = "Allow"
    actions = [
      "ec2:CreateSecurityGroup"
    ]
    resources = ["*"]
  }

  statement {
    effect = "Allow"
    actions = [
      "ec2:CreateTags"
    ]
    resources = [
      "arn:aws:ec2:*:*:security-group/*"
    ]
    condition {
      test     = "StringEquals"
      values = [
        "CreateSecurityGroup"
      ]
      variable = "ec2:CreateAction"
    }
    condition {
      test     = "Null"
      values = ["false"]
      variable = "aws:RequestTag/elbv2.k8s.aws/cluster"
    }
  }

  statement {
    effect = "Allow"
    actions = [
      "ec2:CreateTags",
      "ec2:DeleteTags"
    ]
    resources = ["arn:aws:ec2:*:*:security-group/*"]
    condition {
      test     = "Null"
      values = ["true"]
      variable = "aws:RequestTag/elbv2.k8s.aws/cluster"
    }

    condition {
      test     = "Null"
      values = ["false"]
      variable = "aws:ResourceTag/elbv2.k8s.aws/cluster"
    }
  }

  statement {
    effect = "Allow"
    actions = [
      "ec2:AuthorizeSecurityGroupIngress",
      "ec2:RevokeSecurityGroupIngress",
      "ec2:DeleteSecurityGroup"
    ]
    resources = ["*"]

    condition {
      test     = "Null"
      values = ["false"]
      variable = "aws:ResourceTag/elbv2.k8s.aws/cluster"
    }
  }

  statement {
    effect = "Allow"
    actions = [
      "elasticloadbalancing:CreateLoadBalancer",
      "elasticloadbalancing:CreateTargetGroup"
    ]
    resources = ["*"]

    condition {
      test     = "Null"
      values = ["false"]
      variable = "aws:RequestTag/elbv2.k8s.aws/cluster"
    }
  }

  statement {
    effect = "Allow"
    actions = [
      "elasticloadbalancing:CreateListener",
      "elasticloadbalancing:DeleteListener",
      "elasticloadbalancing:CreateRule",
      "elasticloadbalancing:DeleteRule"
    ]
    resources = ["*"]
  }

  statement {
    effect = "Allow"
    actions = [
      "elasticloadbalancing:AddTags",
      "elasticloadbalancing:RemoveTags"
    ]
    resources = [
      "arn:aws:elasticloadbalancing:*:*:targetgroup/*/*",
      "arn:aws:elasticloadbalancing:*:*:loadbalancer/net/*/*",
      "arn:aws:elasticloadbalancing:*:*:loadbalancer/app/*/*"
    ]
    condition {
      test     = "Null"
      values = ["true"]
      variable = "aws:RequestTag/elbv2.k8s.aws/cluster"
    }
    condition {
      test     = "Null"
      values = ["false"]
      variable = "aws:ResourceTag/elbv2.k8s.aws/cluster"
    }
  }

  statement {
    effect = "Allow"
    actions = [
      "elasticloadbalancing:AddTags",
      "elasticloadbalancing:RemoveTags"
    ]
    resources = [
      "arn:aws:elasticloadbalancing:*:*:listener/net/*/*/*",
      "arn:aws:elasticloadbalancing:*:*:listener/app/*/*/*",
      "arn:aws:elasticloadbalancing:*:*:listener-rule/net/*/*/*",
      "arn:aws:elasticloadbalancing:*:*:listener-rule/app/*/*/*"
    ]
  }

  statement {
    effect = "Allow"
    actions = [
      "elasticloadbalancing:ModifyLoadBalancerAttributes",
      "elasticloadbalancing:SetIpAddressType",
      "elasticloadbalancing:SetSecurityGroups",
      "elasticloadbalancing:SetSubnets",
      "elasticloadbalancing:DeleteLoadBalancer",
      "elasticloadbalancing:ModifyTargetGroup",
      "elasticloadbalancing:ModifyTargetGroupAttributes",
      "elasticloadbalancing:DeleteTargetGroup",
      "elasticloadbalancing:ModifyListenerAttributes"
    ]
    resources = ["*"]

    condition {
      test     = "Null"
      values = ["false"]
      variable = "aws:ResourceTag/elbv2.k8s.aws/cluster"
    }
  }

  statement {
    effect = "Allow"
    actions = ["elasticloadbalancing:AddTags"]
    resources = [
      "arn:aws:elasticloadbalancing:*:*:targetgroup/*/*",
      "arn:aws:elasticloadbalancing:*:*:loadbalancer/net/*/*",
      "arn:aws:elasticloadbalancing:*:*:loadbalancer/app/*/*"
    ]

    condition {
      test     = "StringEquals"
      values = [
        "CreateTargetGroup",
        "CreateLoadBalancer"
      ]
      variable = "elasticloadbalancing:CreateAction"
    }
    condition {
      test     = "Null"
      values = ["false"]
      variable = "aws:RequestTag/elbv2.k8s.aws/cluster"
    }
  }

  statement {
    effect = "Allow"
    actions = [
      "elasticloadbalancing:RegisterTargets",
      "elasticloadbalancing:DeregisterTargets"
    ]
    resources = ["arn:aws:elasticloadbalancing:*:*:targetgroup/*/*"]
  }

  statement {
    effect = "Allow"
    actions = [
      "elasticloadbalancing:SetWebAcl",
      "elasticloadbalancing:ModifyListener",
      "elasticloadbalancing:AddListenerCertificates",
      "elasticloadbalancing:RemoveListenerCertificates",
      "elasticloadbalancing:ModifyRule"
    ]
    resources = ["*"]
  }

}


data "aws_iam_policy_document" "alb_controller_role_assume_policy" {
  statement {
    effect = "Allow"
    actions = [
      "sts:AssumeRoleWithWebIdentity"
    ]
    principals {
      identifiers = [
        module.eks.oidc_provider_arn
      ]
      type = "Federated"
    }

    condition {
      test     = "StringEquals"
      values = ["sts.amazonaws.com"]
      variable = "${module.eks.oidc_provider}:aud"
    }

    condition {
      test     = "StringEquals"
      values = ["system:serviceaccount:kube-system:aws-load-balancer-controller"]
      variable = "${module.eks.oidc_provider}:sub"
    }
  }
}


data "aws_iam_policy_document" "ebs_csi_role_assume_policy" {
  statement {
    effect = "Allow"
    actions = [
      "sts:AssumeRoleWithWebIdentity"
    ]
    principals {
      identifiers = [
        module.eks.oidc_provider_arn
      ]
      type = "Federated"
    }

    condition {
      test     = "StringEquals"
      values = ["sts.amazonaws.com"]
      variable = "${module.eks.oidc_provider}:aud"
    }

    condition {
      test     = "StringEquals"
      values = ["system:serviceaccount:kube-system:ebs-csi-controller-sa"]
      variable = "${module.eks.oidc_provider}:sub"
    }
  }
}

data "aws_eks_addon_version" "ebs_csi_latest" {
  addon_name = "aws-ebs-csi-driver"
  kubernetes_version = module.eks.cluster_version

  most_recent = true
}

data "aws_iam_policy_document" "lgtm_role_assume_policy" {
  statement {
    effect = "Allow"
    actions = [
      "sts:AssumeRoleWithWebIdentity"
    ]
    principals {
      identifiers = [
        module.eks.oidc_provider_arn
      ]
      type = "Federated"
    }

    condition {
      test     = "StringEquals"
      values = ["sts.amazonaws.com"]
      variable = "${module.eks.oidc_provider}:aud"
    }

    condition {
      test     = "StringEquals"
      values = ["system:serviceaccount:*:*"]
      variable = "${module.eks.oidc_provider}:sub"
    }
  }
}


