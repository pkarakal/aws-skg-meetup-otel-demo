# ECR Service Repositories
resource "aws_ecr_repository" "ecr_service_repositories" {
  for_each = { for repo in var.service_repositories : repo.name => repo }

  name                 = each.value.name
  image_tag_mutability = "MUTABLE"

  encryption_configuration {
    encryption_type = "KMS"
  }

  tags = {
    "Component" = "General Infrastructure"
  }
}
