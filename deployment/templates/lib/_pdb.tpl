{{/*
Library template for PodDisruptionBudget resources.
Usage: {{ include "otel-demo.lib.pdb" (dict "ctx" . "component" "cart") }}
*/}}
{{- define "otel-demo.lib.pdb" -}}
{{- $componentValues := index .ctx.Values .component }}
{{- if and $componentValues.enabled $componentValues.podDisruptionBudget.enabled }}
apiVersion: policy/v1
kind: PodDisruptionBudget
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
  {{- if $componentValues.podDisruptionBudget.minAvailable }}
  minAvailable: {{ $componentValues.podDisruptionBudget.minAvailable }}
  {{- end }}
  {{- if $componentValues.podDisruptionBudget.maxUnavailable }}
  maxUnavailable: {{ $componentValues.podDisruptionBudget.maxUnavailable }}
  {{- end }}
  {{- if $componentValues.podDisruptionBudget.unhealthyPodEvictionPolicy }}
  unhealthyPodEvictionPolicy: {{ $componentValues.podDisruptionBudget.unhealthyPodEvictionPolicy }}
  {{- end }}
  selector:
    matchLabels:
      {{- include "otel-demo.selectorLabels" . | nindent 6 }}
{{- end }}
{{- end }}
