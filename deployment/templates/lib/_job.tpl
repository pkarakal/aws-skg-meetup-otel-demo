{{/*
Library template for Job resources.
Usage: {{ include "otel-demo.lib.job" (dict "ctx" . "component" "loadTesting") }}
*/}}
{{- define "otel-demo.lib.job" -}}
{{- $componentValues := index .ctx.Values .component }}
{{- /* Use component field from values if available (for Kubernetes naming compliance) */}}
{{- $componentName := $componentValues.component | default .component }}
{{- /* $nameCtx is used for resource naming (uses kebab-case component name) */}}
{{- $nameCtx := dict "ctx" .ctx "component" $componentName }}
{{- if $componentValues.enabled }}
apiVersion: batch/v1
kind: Job
metadata:
  name: {{ include "otel-demo.resourceName" $nameCtx }}
  namespace: {{ include "otel-demo.namespace" .ctx }}
  labels:
    {{- include "otel-demo.labels" $nameCtx | nindent 4 }}
  {{- with $componentValues.annotations }}
  annotations:
    {{- toYaml . | nindent 4 }}
  {{- end }}
spec:
  {{- if kindIs "invalid" $componentValues.backoffLimit }}
  backoffLimit: 3
  {{- else }}
  backoffLimit: {{ $componentValues.backoffLimit }}
  {{- end }}
  {{- if kindIs "invalid" $componentValues.ttlSecondsAfterFinished }}
  ttlSecondsAfterFinished: 3600
  {{- else }}
  ttlSecondsAfterFinished: {{ $componentValues.ttlSecondsAfterFinished }}
  {{- end }}
  {{- if $componentValues.activeDeadlineSeconds }}
  activeDeadlineSeconds: {{ $componentValues.activeDeadlineSeconds }}
  {{- end }}
  template:
    metadata:
      labels:
        {{- include "otel-demo.podLabels" $nameCtx | nindent 8 }}
      {{- $annotations := include "otel-demo.podAnnotations" . }}
      {{- if $annotations }}
      annotations:
        {{- $annotations | nindent 8 }}
      {{- end }}
    spec:
      restartPolicy: {{ $componentValues.restartPolicy | default "Never" }}
      {{- include "otel-demo.imagePullSecrets" .ctx | nindent 6 }}
      {{- $podSecurityContext := include "otel-demo.podSecurityContext" . }}
      {{- if $podSecurityContext }}
      securityContext:
        {{- $podSecurityContext | nindent 8 }}
      {{- end }}
      containers:
        - name: {{ $componentName }}
          image: {{ include "otel-demo.image" . }}
          imagePullPolicy: {{ include "otel-demo.imagePullPolicy" . }}
          {{- with $componentValues.command }}
          command:
            {{- toYaml . | nindent 12 }}
          {{- end }}
          {{- with $componentValues.args }}
          args:
            {{- toYaml . | nindent 12 }}
          {{- end }}
          {{- $containerSecurityContext := include "otel-demo.containerSecurityContext" . }}
          {{- if $containerSecurityContext }}
          securityContext:
            {{- $containerSecurityContext | nindent 12 }}
          {{- end }}
          {{- if or $componentValues.env .ctx.Values.telemetry.enabled }}
          env:
            {{- if .ctx.Values.telemetry.enabled }}
            - name: OTEL_EXPORTER_OTLP_ENDPOINT
              value: "http://{{ include "otel-demo.collector.grpcEndpoint" .ctx }}"
            {{- end }}
            {{- /* Service discovery URLs - computed at template time */}}
            - name: CART_SERVICE_URL
              value: "http://{{ include "otel-demo.resourceName" (dict "ctx" .ctx "component" "cart") }}.{{ include "otel-demo.namespace" .ctx }}.svc.cluster.local"
            - name: CATALOG_SERVICE_URL
              value: "http://{{ include "otel-demo.resourceName" (dict "ctx" .ctx "component" "catalog") }}.{{ include "otel-demo.namespace" .ctx }}.svc.cluster.local"
            - name: CHECKOUT_SERVICE_URL
              value: "http://{{ include "otel-demo.resourceName" (dict "ctx" .ctx "component" "checkout") }}.{{ include "otel-demo.namespace" .ctx }}.svc.cluster.local"
            {{- with $componentValues.env }}
            {{- toYaml . | nindent 12 }}
            {{- end }}
          {{- end }}
          {{- with $componentValues.resources }}
          resources:
            {{- toYaml . | nindent 12 }}
          {{- end }}
{{- end }}
{{- end }}
