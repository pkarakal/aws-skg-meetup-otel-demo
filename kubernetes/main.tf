provider "aws" {
  region = var.region
}

provider "aws" {
  region = "us-east-1"
  alias  = "virginia"
}

provider "helm" {
  kubernetes {
    host                   = module.eks.cluster_endpoint
    cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)

    exec {
      api_version = "client.authentication.k8s.io/v1beta1"
      args        = ["eks", "get-token", "--cluster-name", module.eks.cluster_name]
      command     = "aws"
    }
  }
}

provider "kubectl" {
  apply_retry_count      = 5
  host                   = module.eks.cluster_endpoint
  cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)
  load_config_file       = false

  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    command     = "aws"
    # This requires the awscli to be installed locally where Terraform is executed
    args = ["eks", "get-token", "--cluster-name", module.eks.cluster_name]
  }
}

provider "kubernetes" {
  host                   = module.eks.cluster_endpoint
  cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)

  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    args        = ["eks", "get-token", "--cluster-name", module.eks.cluster_name]
    command     = "aws"
  }
}

# EKS
resource "aws_iam_policy" "eks_fargate_profile_policy" {
  name = "eks-fargate-profile-policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "ec2:Describe*",
        ]
        Effect   = "Allow"
        Resource = "*"
      }
    ]
  })
}

# AWS Load Balancer Controller
resource "helm_release" "aws_load_balancer_controller" {
  namespace        = "kube-system"
  create_namespace = true
  name             = "aws-load-balancer-controller"
  repository       = "https://aws.github.io/eks-charts"
  chart            = "aws-load-balancer-controller"
  version          = "1.9.1"
  wait             = false

  values = [
    <<-EOT
    clusterName: ${module.eks.cluster_name}
    vpcId: ${module.vpc.vpc_id}
    region: ${var.region}
    serviceAccount:
      create: true
      name: aws-load-balancer-controller
      annotations:
        eks.amazonaws.com/role-arn: ${aws_iam_role.alb_controller_role.arn}
    EOT
  ]
}

# Cloudflare API Token Secret for external-dns
resource "kubernetes_secret" "cloudflare_api_token" {
  metadata {
    name      = "cloudflare-api-token"
    namespace = "kube-system"
  }

  data = {
    cloudflare_api_token = var.cloudflare_api_token
    email = var.cloudflare_api_email
  }

  type = "Opaque"
}

# External DNS - Cloudflare provider
resource "helm_release" "external_dns" {
  namespace        = "kube-system"
  create_namespace = true
  name             = "external-dns"
  repository       = "https://kubernetes-sigs.github.io/external-dns/"
  chart            = "external-dns"
  version          = "1.15.0"
  wait             = false

  values = [
    <<-EOT
    provider:
      name: cloudflare
    env:
      - name: CF_API_TOKEN
        valueFrom:
          secretKeyRef:
            name: cloudflare-api-token
            key: cloudflare_api_token
      - name: CF_API_EMAIL
        valueFrom:
          secretKeyRef:
            name: cloudflare-api-key
            key: email
    extraArgs:
      - --zone-id-filter=${var.cloudflare_zone_id}
      - --cloudflare-dns-records-per-page=5000
      - --cloudflare-proxied=false
    domainFilters:
      - pkarakal.com
    policy: sync
    txtOwnerId: "aws-skg-otel-demo"
    sources:
      - ingress
    EOT
  ]

  depends_on = [
    kubernetes_secret.cloudflare_api_token,
    module.eks
  ]
}

resource "kubectl_manifest" "otel_demo_namespace" {
  yaml_body = <<-YAML
apiVersion: v1
kind: Namespace
metadata:
  name: otel-demo
YAML
}
