{{/*
Library template for ServiceAccount resources.
Usage: {{ include "otel-demo.lib.serviceaccount" (dict "ctx" . "component" "cart") }}
*/}}
{{- define "otel-demo.lib.serviceaccount" -}}
{{- $componentValues := index .ctx.Values .component }}
{{- if and $componentValues.enabled $componentValues.serviceAccount.create }}
apiVersion: v1
kind: ServiceAccount
metadata:
  name: {{ include "otel-demo.serviceAccountName" . }}
  namespace: {{ include "otel-demo.namespace" .ctx }}
  labels:
    {{- include "otel-demo.labels" . | nindent 4 }}
  {{- $annotations := include "otel-demo.serviceAccountAnnotations" . }}
  {{- if $annotations }}
  annotations:
    {{- $annotations | nindent 4 }}
  {{- end }}
automountServiceAccountToken: {{ $componentValues.serviceAccount.automount | default false }}
{{- end }}
{{- end }}
