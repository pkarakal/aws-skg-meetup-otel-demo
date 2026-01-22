{{/*
Library template for ConfigMap resources.
Usage: {{ include "otel-demo.lib.configmap" (dict "ctx" . "component" "cart") }}
*/}}
{{- define "otel-demo.lib.configmap" -}}
{{- $componentValues := index .ctx.Values .component }}
{{- if and $componentValues.enabled $componentValues.config }}
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ include "otel-demo.resourceName" . }}-config
  namespace: {{ include "otel-demo.namespace" .ctx }}
  labels:
    {{- include "otel-demo.labels" . | nindent 4 }}
  {{- with .ctx.Values.global.commonAnnotations }}
  annotations:
    {{- toYaml . | nindent 4 }}
  {{- end }}
data:
  {{- if $componentValues.config.content }}
  {{ $componentValues.config.fileName | default "config.yaml" }}: |
    {{- $componentValues.config.content | nindent 4 }}
  {{- end }}
  {{- with $componentValues.config.data }}
  {{- toYaml . | nindent 2 }}
  {{- end }}
{{- end }}
{{- end }}
