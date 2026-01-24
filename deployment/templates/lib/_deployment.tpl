{{/*
Library template for Deployment resources.
Usage: {{ include "otel-demo.lib.deployment" (dict "ctx" . "component" "cart") }}
*/}}
{{- define "otel-demo.lib.deployment" -}}
{{- $componentValues := index .ctx.Values .component }}
{{- if $componentValues.enabled }}
apiVersion: apps/v1
kind: Deployment
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
  {{- if not $componentValues.autoscaling.enabled }}
  replicas: {{ $componentValues.replicas | default 1 }}
  {{- end }}
  selector:
    matchLabels:
      {{- include "otel-demo.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      labels:
        {{- include "otel-demo.podLabels" . | nindent 8 }}
      {{- $annotations := include "otel-demo.podAnnotations" . }}
      {{- if $annotations }}
      annotations:
        {{- $annotations | nindent 8 }}
      {{- end }}
    spec:
      {{- include "otel-demo.imagePullSecrets" .ctx | nindent 6 }}
      serviceAccountName: {{ include "otel-demo.serviceAccountName" . }}
      automountServiceAccountToken: {{ $componentValues.serviceAccount.automount | default false }}
      {{- $podSecurityContext := include "otel-demo.podSecurityContext" . }}
      {{- if $podSecurityContext }}
      securityContext:
        {{- $podSecurityContext | nindent 8 }}
      {{- end }}
      {{- include "otel-demo.priorityClassName" . | nindent 6 }}
      {{- with $componentValues.nodeSelector }}
      nodeSelector:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with $componentValues.affinity }}
      affinity:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with $componentValues.tolerations }}
      tolerations:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      containers:
        - name: {{ .component }}
          image: {{ include "otel-demo.image" . }}
          imagePullPolicy: {{ include "otel-demo.imagePullPolicy" . }}
          {{- $containerSecurityContext := include "otel-demo.containerSecurityContext" . }}
          {{- if $containerSecurityContext }}
          securityContext:
            {{- $containerSecurityContext | nindent 12 }}
          {{- end }}
          ports:
            - name: http
              containerPort: {{ $componentValues.containerPort }}
              protocol: TCP
          {{- include "otel-demo.livenessProbe" . | nindent 10 }}
          {{- include "otel-demo.readinessProbe" . | nindent 10 }}
          {{- include "otel-demo.startupProbe" . | nindent 10 }}
          {{- with $componentValues.resources }}
          resources:
            {{- toYaml . | nindent 12 }}
          {{- end }}
          {{- if or $componentValues.extraEnv $componentValues.env .ctx.Values.telemetry.enabled }}
          env:
            {{- if .ctx.Values.telemetry.enabled }}
            - name: OTEL_EXPORTER_OTLP_ENDPOINT
              value: "http://{{ include "otel-demo.collector.grpcEndpoint" .ctx }}"
            {{- end }}
            {{- with $componentValues.env }}
            {{- toYaml . | nindent 12 }}
            {{- end }}
            {{- with $componentValues.extraEnv }}
            {{- toYaml . | nindent 12 }}
            {{- end }}
          {{- end }}
          {{- with $componentValues.extraEnvFrom }}
          envFrom:
            {{- toYaml . | nindent 12 }}
          {{- end }}
          {{- if or $componentValues.config $componentValues.extraVolumeMounts }}
          volumeMounts:
            {{- if $componentValues.config }}
            - name: config
              mountPath: {{ $componentValues.config.mountPath }}
              {{- if $componentValues.config.subPath }}
              subPath: {{ $componentValues.config.subPath }}
              {{- end }}
              readOnly: true
            {{- end }}
            {{- with $componentValues.extraVolumeMounts }}
            {{- toYaml . | nindent 12 }}
            {{- end }}
          {{- end }}
      {{- if or $componentValues.config $componentValues.extraVolumes }}
      volumes:
        {{- if $componentValues.config }}
        - name: config
          configMap:
            name: {{ include "otel-demo.resourceName" . }}-config
            {{- if $componentValues.config.items }}
            items:
              {{- range $componentValues.config.items }}
              - key: {{ .key }}
                path: {{ .path }}
              {{- end }}
            {{- end }}
        {{- end }}
        {{- with $componentValues.extraVolumes }}
        {{- toYaml . | nindent 8 }}
        {{- end }}
      {{- end }}
{{- end }}
{{- end }}
