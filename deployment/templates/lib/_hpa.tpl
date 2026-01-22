{{/*
Library template for HorizontalPodAutoscaler resources.
Usage: {{ include "otel-demo.lib.hpa" (dict "ctx" . "component" "cart") }}
*/}}
{{- define "otel-demo.lib.hpa" -}}
{{- $componentValues := index .ctx.Values .component }}
{{- if and $componentValues.enabled $componentValues.autoscaling.enabled }}
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: {{ include "otel-demo.resourceName" . }}
  namespace: {{ include "otel-demo.namespace" .ctx }}
  labels:
    {{- include "otel-demo.labels" . | nindent 4 }}
  {{- with .ctx.Values.global.commonAnnotations }}
  annotations:
    {{- toYaml . | nindent 4 }}
  {{- end }}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: {{ include "otel-demo.resourceName" . }}
  minReplicas: {{ $componentValues.autoscaling.minReplicas | default 1 }}
  maxReplicas: {{ $componentValues.autoscaling.maxReplicas | default 10 }}
  metrics:
    {{- if $componentValues.autoscaling.metrics }}
    {{- toYaml $componentValues.autoscaling.metrics | nindent 4 }}
    {{- else }}
    {{- if $componentValues.autoscaling.targetCPUUtilizationPercentage }}
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: {{ $componentValues.autoscaling.targetCPUUtilizationPercentage }}
    {{- end }}
    {{- if $componentValues.autoscaling.targetMemoryUtilizationPercentage }}
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: {{ $componentValues.autoscaling.targetMemoryUtilizationPercentage }}
    {{- end }}
    {{- end }}
  {{- if $componentValues.autoscaling.behavior }}
  behavior:
    {{- toYaml $componentValues.autoscaling.behavior | nindent 4 }}
  {{- end }}
{{- end }}
{{- end }}
