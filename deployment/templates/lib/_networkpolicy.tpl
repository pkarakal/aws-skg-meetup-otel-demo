{{/*
Library template for NetworkPolicy resources.
Usage: {{ include "otel-demo.lib.networkpolicy" (dict "ctx" . "component" "cart") }}
*/}}
{{- define "otel-demo.lib.networkpolicy" -}}
{{- $componentValues := index .ctx.Values .component }}
{{- if and $componentValues.enabled $componentValues.networkPolicy.enabled }}
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
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
  podSelector:
    matchLabels:
      {{- include "otel-demo.selectorLabels" . | nindent 6 }}
  policyTypes:
    - Ingress
    - Egress
  ingress:
    {{- if $componentValues.networkPolicy.ingress }}
    {{- toYaml $componentValues.networkPolicy.ingress | nindent 4 }}
    {{- else }}
    # Default: Allow ingress from same namespace
    - from:
        - namespaceSelector:
            matchLabels:
              kubernetes.io/metadata.name: {{ include "otel-demo.namespace" .ctx }}
      ports:
        - port: {{ $componentValues.containerPort }}
          protocol: TCP
    {{- end }}
  egress:
    {{- if $componentValues.networkPolicy.egress }}
    {{- toYaml $componentValues.networkPolicy.egress | nindent 4 }}
    {{- else }}
    # Default: Allow DNS and same namespace egress
    - to:
        - namespaceSelector: {}
      ports:
        - port: 53
          protocol: UDP
        - port: 53
          protocol: TCP
    - to:
        - namespaceSelector:
            matchLabels:
              kubernetes.io/metadata.name: {{ include "otel-demo.namespace" .ctx }}
    {{- end }}
{{- end }}
{{- end }}
