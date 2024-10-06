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
