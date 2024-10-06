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

# Karpenter
resource "helm_release" "karpenter" {
  namespace           = "karpenter"
  create_namespace    = true
  name                = "karpenter"
  repository          = "oci://public.ecr.aws/karpenter"
  repository_username = data.aws_ecrpublic_authorization_token.token.user_name
  repository_password = data.aws_ecrpublic_authorization_token.token.password
  chart               = "karpenter"
  version             = "0.35.1"
  wait                = false

  values = [
    <<-EOT
    settings:
      clusterName: ${module.eks.cluster_name}
      clusterEndpoint: ${module.eks.cluster_endpoint}
      interruptionQueue: ${module.karpenter.queue_name}
    serviceAccount:
      annotations:
        eks.amazonaws.com/role-arn: ${module.karpenter.iam_role_arn}
    tolerations:
      - key: 'eks.amazonaws.com/compute-type'
        operator: Equal
        value: fargate
        effect: "NoSchedule"
    EOT
  ]
}

resource "kubectl_manifest" "karpenter_node_class" {
  yaml_body = <<-YAML
    apiVersion: karpenter.k8s.aws/v1beta1
    kind: EC2NodeClass
    metadata:
      name: default
    spec:
      amiFamily: AL2
      role: ${module.karpenter.node_iam_role_name}
      subnetSelectorTerms:
        - tags:
            karpenter.sh/discovery: ${module.eks.cluster_name}
      securityGroupSelectorTerms:
        - tags:
            karpenter.sh/discovery: ${module.eks.cluster_name}
      tags:
        karpenter.sh/discovery: ${module.eks.cluster_name}
  YAML

  depends_on = [
    helm_release.karpenter
  ]
}

resource "kubectl_manifest" "karpenter_node_pool" {
  yaml_body = <<-YAML
    apiVersion: karpenter.sh/v1beta1
    kind: NodePool
    metadata:
      name: default
    spec:
      template:
        spec:
          nodeClassRef:
            name: default
          requirements:
            - key: "karpenter.k8s.aws/instance-category"
              operator: In
              values: ["c", "m", "r", "t"]
            - key: "karpenter.k8s.aws/instance-cpu"
              operator: In
              values: ["1", "2", "4", "8"]
            - key: "karpenter.sh/capacity-type"
              operator: In
              values: ["spot", "on-demand"]
            - key: "kubernetes.io/arch"
              operator: In
              values: ["amd64"]
      limits:
        cpu: 1000
      disruption:
        consolidationPolicy: WhenEmpty
        consolidateAfter: 30s
  YAML

  depends_on = [
    kubectl_manifest.karpenter_node_class
  ]
}

resource "helm_release" "balancer" {
  namespace        = "kube-system"
  create_namespace = false
  name             = "aws-load-balancer-controller"
  repository       = "https://aws.github.io/eks-charts"
  chart            = "aws-load-balancer-controller"
  version          = "1.8.3"
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

resource "kubectl_manifest" "storage_class" {
  yaml_body = <<-YAML
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: ebs
provisioner: ebs.csi.aws.com
volumeBindingMode: WaitForFirstConsumer
tagSpecification_1: "cluster=${module.eks.cluster_name}"
YAML
}

resource "kubectl_manifest" "otel_demo_namespace" {
  yaml_body = <<-YAML
apiVersion: v1
kind: Namespace
metadata:
  name: otel-demo
YAML
}

resource "helm_release" "postgres" {
  namespace        = "otel-demo"
  create_namespace = false
  name             = "postgresql"
  repository       = "https://charts.bitnami.com/bitnami"
  chart            = "postgresql"
  version          = "15.5.32"
  wait             = false

  values = [
    <<-EOT
    global:
      defaultStorageClass: ebs
      postgresql:
        auth:
          username: backend
          password: pass
          database: shop
    persistence:
      enabled: true
      size: 10Gi
      storageClass: ebs
    EOT
  ]

  depends_on = [
    kubectl_manifest.otel_demo_namespace

  ]
}

resource "helm_release" "redis" {
  namespace        = "otel-demo"
  create_namespace = false
  name             = "redis"
  repository       = "https://charts.bitnami.com/bitnami"
  chart            = "redis"
  version          = "20.1.7"
  wait             = false

  values = [
    <<-EOT
    global:
      defaultStorageClass: ebs
      redis:
        password: aRUEHUyavd
    master:
      persistence:
        enabled: true
        size: 10Gi
        storageClass: ebs
    EOT
  ]

  depends_on = [
    kubectl_manifest.otel_demo_namespace

  ]
}

resource "helm_release" "rabbitmq_operator" {
  namespace        = "otel-demo"
  create_namespace = false
  name             = "rabbitmq"
  repository       = "https://charts.bitnami.com/bitnami"
  chart            = "rabbitmq-cluster-operator"
  version          = "4.3.24"
  wait             = false

  values = [
    <<-EOT
    global:
      defaultStorageClass: ebs
    extraDeploy:
      - apiVersion: rabbitmq.com/v1beta1
        kind: RabbitmqCluster
        metadata:
          name: rabbitmq
        spec:
          replicas: 1
          rabbitmq:
            additionalPlugins:
              - rabbitmq_stream
            additionalConfig: |
              cluster_partition_handling = pause_minority
              disk_free_limit.relative = 1.0
              collect_statistics_interval = 10000
          persistence:
            storageClassName: ebs
            storage: 10Gi

    EOT
  ]

  depends_on = [
    kubectl_manifest.otel_demo_namespace
  ]
}

data "kubectl_file_documents" "otel_manifests" {
  content = file("${path.module}/otel-resources.yaml")
}

resource "kubectl_manifest" "otel_resources" {
  count     = length(data.kubectl_file_documents.otel_manifests.documents)
  yaml_body = element(data.kubectl_file_documents.otel_manifests.documents, count.index)
}