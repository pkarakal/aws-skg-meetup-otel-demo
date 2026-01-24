{{/*
Library template for Service resources.
Usage: {{ include "otel-demo.lib.service" (dict "ctx" . "component" "cart") }}
*/}}
{{- define "otel-demo.lib.service" -}}
{{- $componentValues := index .ctx.Values .component }}
{{- if and $componentValues.enabled $componentValues.service.enabled }}
apiVersion: v1
kind: Service
metadata:
  name: {{ include "otel-demo.resourceName" . }}
  namespace: {{ include "otel-demo.namespace" .ctx }}
  labels:
    {{- include "otel-demo.labels" . | nindent 4 }}
    {{- with $componentValues.service.labels }}
    {{- toYaml . | nindent 4 }}
    {{- end }}
  {{- $annotations := dict }}
  {{- if .ctx.Values.global.commonAnnotations }}
  {{- $annotations = merge $annotations .ctx.Values.global.commonAnnotations }}
  {{- end }}
  {{- if $componentValues.service.annotations }}
  {{- $annotations = merge $annotations $componentValues.service.annotations }}
  {{- end }}
  {{- with $annotations }}
  annotations:
    {{- toYaml . | nindent 4 }}
  {{- end }}
spec:
  type: {{ $componentValues.service.type | default "ClusterIP" }}
  {{- if and (eq $componentValues.service.type "LoadBalancer") $componentValues.service.loadBalancerIP }}
  loadBalancerIP: {{ $componentValues.service.loadBalancerIP }}
  {{- end }}
  {{- if and (eq $componentValues.service.type "LoadBalancer") $componentValues.service.loadBalancerSourceRanges }}
  loadBalancerSourceRanges:
    {{- toYaml $componentValues.service.loadBalancerSourceRanges | nindent 4 }}
  {{- end }}
  {{- if $componentValues.service.externalTrafficPolicy }}
  externalTrafficPolicy: {{ $componentValues.service.externalTrafficPolicy }}
  {{- end }}
  {{- if $componentValues.service.sessionAffinity }}
  sessionAffinity: {{ $componentValues.service.sessionAffinity }}
  {{- end }}
  ports:
    - name: http
      port: {{ $componentValues.service.port | default 80 }}
      targetPort: http
      protocol: TCP
      {{- if and (eq $componentValues.service.type "NodePort") $componentValues.service.nodePort }}
      nodePort: {{ $componentValues.service.nodePort }}
      {{- end }}
    {{- with $componentValues.service.extraPorts }}
    {{- toYaml . | nindent 4 }}
    {{- end }}
  selector:
    {{- include "otel-demo.selectorLabels" . | nindent 4 }}
{{- end }}
{{- end }}
