# Bucket for storing the state file
resource "aws_s3_bucket" "mimir" {
  bucket = "aws-skg-otel-demo-mimir-pkarakal"
}

resource "aws_s3_bucket_ownership_controls" "mimir_bucket_ownership_controls" {
  bucket = aws_s3_bucket.mimir.id

  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "mimir_bucket_acl" {
  depends_on = [aws_s3_bucket_ownership_controls.mimir_bucket_ownership_controls]
  bucket     = aws_s3_bucket.mimir.id
  acl        = "private"
}

resource "aws_s3_bucket_server_side_encryption_configuration" "mimir_bucket_encryption" {
  bucket = aws_s3_bucket.mimir.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms"
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "mimir_bucket_public_access_block" {
  bucket = aws_s3_bucket.mimir.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}



resource "aws_s3_bucket" "loki" {
  bucket = "aws-skg-otel-demo-loki-pkarakal"
}

resource "aws_s3_bucket_ownership_controls" "loki_bucket_ownership_controls" {
  bucket = aws_s3_bucket.loki.id

  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "loki_bucket_acl" {
  depends_on = [aws_s3_bucket_ownership_controls.loki_bucket_ownership_controls]
  bucket     = aws_s3_bucket.loki.id
  acl        = "private"
}

resource "aws_s3_bucket_server_side_encryption_configuration" "loki_bucket_encryption" {
  bucket = aws_s3_bucket.loki.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms"
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "loki_bucket_public_access_block" {
  bucket = aws_s3_bucket.loki.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}



resource "aws_s3_bucket" "tempo" {
  bucket = "aws-skg-otel-demo-tempo-pkarakal"
}

resource "aws_s3_bucket_ownership_controls" "tempo_bucket_ownership_controls" {
  bucket = aws_s3_bucket.tempo.id

  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "tempo_bucket_acl" {
  depends_on = [aws_s3_bucket_ownership_controls.tempo_bucket_ownership_controls]
  bucket     = aws_s3_bucket.tempo.id
  acl        = "private"
}

resource "aws_s3_bucket_server_side_encryption_configuration" "tempo_bucket_encryption" {
  bucket = aws_s3_bucket.tempo.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms"
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "tempo_bucket_public_access_block" {
  bucket = aws_s3_bucket.tempo.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}



resource "aws_s3_bucket" "catalog" {
  bucket = "aws-skg-otel-demo-catalog-pkarakal"
}

resource "aws_s3_bucket_ownership_controls" "catalog_bucket_ownership_controls" {
  bucket = aws_s3_bucket.catalog.id

  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "catalog_bucket_acl" {
  depends_on = [aws_s3_bucket_ownership_controls.catalog_bucket_ownership_controls]
  bucket     = aws_s3_bucket.catalog.id
  acl        = "private"
}

resource "aws_s3_bucket_server_side_encryption_configuration" "catalog_bucket_encryption" {
  bucket = aws_s3_bucket.catalog.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms"
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "catalog_bucket_public_access_block" {
  bucket = aws_s3_bucket.catalog.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket" "otel_config" {
  bucket = "aws-skg-otel-demo-config-bucket-pkarakal"
}

resource "aws_s3_bucket_ownership_controls" "otel_config_bucket_ownership_controls" {
  bucket = aws_s3_bucket.otel_config.id

  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "otel_config_bucket_acl" {
  depends_on = [aws_s3_bucket_ownership_controls.otel_config_bucket_ownership_controls]
  bucket     = aws_s3_bucket.otel_config.id
  acl        = "private"
}

resource "aws_s3_bucket_server_side_encryption_configuration" "otel_config_bucket_encryption" {
  bucket = aws_s3_bucket.otel_config.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms"
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "otel_config_bucket_public_access_block" {
  bucket = aws_s3_bucket.otel_config.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_object" "otel_config" {
  bucket = aws_s3_bucket.otel_config.id
  key    = "otel-collector-config.yml"

  content = <<EOT
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: "0.0.0.0:4317"
      http:
        endpoint: "0.0.0.0:4318"

processors:
  batch:
  decouple:
  coldstart:

exporters:
  otlp:
    endpoint: https://alloy.pkarakal.com

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [ batch, decouple, coldstart ]
      exporters: [otlp]
    metrics:
      receivers: [otlp]
      processors: [ batch, decouple ]
      exporters: [otlp]
    logs:
      receivers: [otlp]
      exporters: [otlp]
EOT
}
