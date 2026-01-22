{{/*
Library template for Ingress resources.
Usage: {{ include "otel-demo.lib.ingress" (dict "ctx" . "component" "cart") }}
*/}}
{{- define "otel-demo.lib.ingress" -}}
{{- $componentValues := index .ctx.Values .component }}
{{- if and $componentValues.enabled $componentValues.ingress.enabled }}
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: {{ include "otel-demo.resourceName" . }}
  namespace: {{ include "otel-demo.namespace" .ctx }}
  labels:
    {{- include "otel-demo.labels" . | nindent 4 }}
    {{- with $componentValues.ingress.labels }}
    {{- toYaml . | nindent 4 }}
    {{- end }}
  {{- $annotations := dict }}
  {{- if .ctx.Values.global.commonAnnotations }}
  {{- $annotations = merge $annotations .ctx.Values.global.commonAnnotations }}
  {{- end }}
  {{- if $componentValues.ingress.annotations }}
  {{- $annotations = merge $annotations $componentValues.ingress.annotations }}
  {{- end }}
  {{- with $annotations }}
  annotations:
    {{- toYaml . | nindent 4 }}
  {{- end }}
spec:
  {{- if $componentValues.ingress.className }}
  ingressClassName: {{ $componentValues.ingress.className }}
  {{- end }}
  {{- if $componentValues.ingress.tls }}
  tls:
    {{- range $componentValues.ingress.tls }}
    - hosts:
        {{- range .hosts }}
        - {{ . | quote }}
        {{- end }}
      {{- if .secretName }}
      secretName: {{ .secretName }}
      {{- end }}
    {{- end }}
  {{- end }}
  rules:
    {{- if $componentValues.ingress.hosts }}
    {{- range $componentValues.ingress.hosts }}
    - host: {{ .host | quote }}
      http:
        paths:
          {{- range .paths }}
          - path: {{ .path }}
            pathType: {{ .pathType | default "Prefix" }}
            backend:
              service:
                name: {{ include "otel-demo.resourceName" $ }}
                port:
                  number: {{ $componentValues.service.port | default 80 }}
          {{- end }}
    {{- end }}
    {{- else }}
    - http:
        paths:
          {{- range $componentValues.ingress.paths }}
          - path: {{ .path }}
            pathType: {{ .pathType | default "Prefix" }}
            backend:
              service:
                name: {{ include "otel-demo.resourceName" $ }}
                port:
                  number: {{ $componentValues.service.port | default 80 }}
          {{- end }}
    {{- end }}
{{- end }}
{{- end }}
