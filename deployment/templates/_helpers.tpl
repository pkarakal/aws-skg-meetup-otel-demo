{{/*
Expand the name of the chart.
*/}}
{{- define "otel-demo.name" -}}
{{- default .Chart.Name .Values.global.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "otel-demo.fullname" -}}
{{- if .Values.global.fullnameOverride }}
{{- .Values.global.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.global.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "otel-demo.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a component-aware resource name.
Usage: {{ include "otel-demo.resourceName" (dict "ctx" . "component" "cart") }}
*/}}
{{- define "otel-demo.resourceName" -}}
{{- $fullname := include "otel-demo.fullname" .ctx }}
{{- printf "%s-%s" $fullname .component | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Get component section from values.
Usage: {{ include "otel-demo.componentSection" (dict "ctx" . "component" "cart") }}
Returns the component's values section.
*/}}
{{- define "otel-demo.componentSection" -}}
{{- $component := .component }}
{{- index .ctx.Values $component | toYaml }}
{{- end }}

{{/*
Common labels with component support.
Usage: {{ include "otel-demo.labels" (dict "ctx" . "component" "cart") }}
*/}}
{{- define "otel-demo.labels" -}}
helm.sh/chart: {{ include "otel-demo.chart" .ctx }}
{{ include "otel-demo.selectorLabels" . }}
{{- if .ctx.Chart.AppVersion }}
app.kubernetes.io/version: {{ .ctx.Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .ctx.Release.Service }}
{{- with .ctx.Values.global.commonLabels }}
{{ toYaml . }}
{{- end }}
{{- end }}

{{/*
Selector labels with component support.
Usage: {{ include "otel-demo.selectorLabels" (dict "ctx" . "component" "cart") }}
*/}}
{{- define "otel-demo.selectorLabels" -}}
app.kubernetes.io/name: {{ include "otel-demo.name" .ctx }}
app.kubernetes.io/instance: {{ .ctx.Release.Name }}
app.kubernetes.io/component: {{ .component }}
{{- end }}

{{/*
Pod labels with component support - merges global, component, and selector labels.
Usage: {{ include "otel-demo.podLabels" (dict "ctx" . "component" "cart") }}
*/}}
{{- define "otel-demo.podLabels" -}}
{{ include "otel-demo.selectorLabels" . }}
{{- $componentValues := index .ctx.Values .component }}
{{- with .ctx.Values.global.podLabels }}
{{ toYaml . }}
{{- end }}
{{- with $componentValues.podLabels }}
{{ toYaml . }}
{{- end }}
{{- end }}

{{/*
Pod annotations - merges global and component annotations.
Usage: {{ include "otel-demo.podAnnotations" (dict "ctx" . "component" "cart") }}
*/}}
{{- define "otel-demo.podAnnotations" -}}
{{- $componentValues := index .ctx.Values .component }}
{{- $annotations := dict }}
{{- if .ctx.Values.global.podAnnotations }}
{{- $annotations = merge $annotations .ctx.Values.global.podAnnotations }}
{{- end }}
{{- if $componentValues.podAnnotations }}
{{- $annotations = merge $annotations $componentValues.podAnnotations }}
{{- end }}
{{- with $annotations }}
{{ toYaml . }}
{{- end }}
{{- end }}

{{/*
Create the name of the service account to use.
Usage: {{ include "otel-demo.serviceAccountName" (dict "ctx" . "component" "cart") }}
*/}}
{{- define "otel-demo.serviceAccountName" -}}
{{- $componentValues := index .ctx.Values .component }}
{{- if $componentValues.serviceAccount.create }}
{{- default (include "otel-demo.resourceName" .) $componentValues.serviceAccount.name }}
{{- else }}
{{- default "default" $componentValues.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Service account annotations - merges global and component annotations with IRSA support.
Usage: {{ include "otel-demo.serviceAccountAnnotations" (dict "ctx" . "component" "cart") }}
*/}}
{{- define "otel-demo.serviceAccountAnnotations" -}}
{{- $componentValues := index .ctx.Values .component }}
{{- $annotations := dict }}
{{- if .ctx.Values.serviceAccount.annotations }}
{{- $annotations = merge $annotations .ctx.Values.serviceAccount.annotations }}
{{- end }}
{{- if $componentValues.serviceAccount.annotations }}
{{- $annotations = merge $annotations $componentValues.serviceAccount.annotations }}
{{- end }}
{{- with $annotations }}
{{ toYaml . }}
{{- end }}
{{- end }}

{{/*
Pod security context - merges global rbac defaults with component overrides.
Component-specific values take precedence over global defaults.
Usage: {{ include "otel-demo.podSecurityContext" (dict "ctx" . "component" "cart") }}
*/}}
{{- define "otel-demo.podSecurityContext" -}}
{{- $componentValues := index .ctx.Values .component }}
{{- $securityContext := deepCopy .ctx.Values.rbac.podSecurityContext }}
{{- if $componentValues.podSecurityContext }}
{{- $securityContext = mustMergeOverwrite $securityContext $componentValues.podSecurityContext }}
{{- end }}
{{- with $securityContext }}
{{ toYaml . }}
{{- end }}
{{- end }}

{{/*
Container security context - merges global rbac defaults with component overrides.
Component-specific values take precedence over global defaults.
Usage: {{ include "otel-demo.containerSecurityContext" (dict "ctx" . "component" "cart") }}
*/}}
{{- define "otel-demo.containerSecurityContext" -}}
{{- $componentValues := index .ctx.Values .component }}
{{- $securityContext := deepCopy .ctx.Values.rbac.containerSecurityContext }}
{{- if $componentValues.containerSecurityContext }}
{{- $securityContext = mustMergeOverwrite $securityContext $componentValues.containerSecurityContext }}
{{- end }}
{{- with $securityContext }}
{{ toYaml . }}
{{- end }}
{{- end }}

{{/*
Build image reference.
Usage: {{ include "otel-demo.image" (dict "ctx" . "component" "cart") }}
*/}}
{{- define "otel-demo.image" -}}
{{- $componentValues := index .ctx.Values .component }}
{{- $registry := .ctx.Values.global.image.registry }}
{{- $repository := $componentValues.image.repository }}
{{- $tag := $componentValues.image.tag | default "latest" }}
{{- if $registry }}
{{- printf "%s/%s:%s" $registry $repository $tag }}
{{- else }}
{{- printf "%s:%s" $repository $tag }}
{{- end }}
{{- end }}

{{/*
Get image pull policy.
Usage: {{ include "otel-demo.imagePullPolicy" (dict "ctx" . "component" "cart") }}
*/}}
{{- define "otel-demo.imagePullPolicy" -}}
{{- $componentValues := index .ctx.Values .component }}
{{- $pullPolicy := .ctx.Values.global.image.pullPolicy }}
{{- if $componentValues.image.pullPolicy }}
{{- $pullPolicy = $componentValues.image.pullPolicy }}
{{- end }}
{{- $pullPolicy }}
{{- end }}

{{/*
Render liveness probe if enabled.
Usage: {{ include "otel-demo.livenessProbe" (dict "ctx" . "component" "cart") }}
*/}}
{{- define "otel-demo.livenessProbe" -}}
{{- $componentValues := index .ctx.Values .component }}
{{- if $componentValues.livenessProbe.enabled }}
livenessProbe:
{{- if $componentValues.livenessProbe.httpGet }}
  httpGet:
    path: {{ $componentValues.livenessProbe.httpGet.path }}
    port: {{ $componentValues.livenessProbe.httpGet.port }}
{{- end }}
{{- if $componentValues.livenessProbe.tcpSocket }}
  tcpSocket:
    port: {{ $componentValues.livenessProbe.tcpSocket.port }}
{{- end }}
{{- if $componentValues.livenessProbe.grpc }}
  grpc:
    port: {{ $componentValues.livenessProbe.grpc.port }}
{{- end }}
  initialDelaySeconds: {{ $componentValues.livenessProbe.initialDelaySeconds | default 10 }}
  periodSeconds: {{ $componentValues.livenessProbe.periodSeconds | default 10 }}
  timeoutSeconds: {{ $componentValues.livenessProbe.timeoutSeconds | default 5 }}
  failureThreshold: {{ $componentValues.livenessProbe.failureThreshold | default 3 }}
  successThreshold: {{ $componentValues.livenessProbe.successThreshold | default 1 }}
{{- end }}
{{- end }}

{{/*
Render readiness probe if enabled.
Usage: {{ include "otel-demo.readinessProbe" (dict "ctx" . "component" "cart") }}
*/}}
{{- define "otel-demo.readinessProbe" -}}
{{- $componentValues := index .ctx.Values .component }}
{{- if $componentValues.readinessProbe.enabled }}
readinessProbe:
{{- if $componentValues.readinessProbe.httpGet }}
  httpGet:
    path: {{ $componentValues.readinessProbe.httpGet.path }}
    port: {{ $componentValues.readinessProbe.httpGet.port }}
{{- end }}
{{- if $componentValues.readinessProbe.tcpSocket }}
  tcpSocket:
    port: {{ $componentValues.readinessProbe.tcpSocket.port }}
{{- end }}
{{- if $componentValues.readinessProbe.grpc }}
  grpc:
    port: {{ $componentValues.readinessProbe.grpc.port }}
{{- end }}
  initialDelaySeconds: {{ $componentValues.readinessProbe.initialDelaySeconds | default 5 }}
  periodSeconds: {{ $componentValues.readinessProbe.periodSeconds | default 10 }}
  timeoutSeconds: {{ $componentValues.readinessProbe.timeoutSeconds | default 5 }}
  failureThreshold: {{ $componentValues.readinessProbe.failureThreshold | default 3 }}
  successThreshold: {{ $componentValues.readinessProbe.successThreshold | default 1 }}
{{- end }}
{{- end }}

{{/*
Render startup probe if enabled.
Usage: {{ include "otel-demo.startupProbe" (dict "ctx" . "component" "cart") }}
*/}}
{{- define "otel-demo.startupProbe" -}}
{{- $componentValues := index .ctx.Values .component }}
{{- if $componentValues.startupProbe.enabled }}
startupProbe:
{{- if $componentValues.startupProbe.httpGet }}
  httpGet:
    path: {{ $componentValues.startupProbe.httpGet.path }}
    port: {{ $componentValues.startupProbe.httpGet.port }}
{{- end }}
{{- if $componentValues.startupProbe.tcpSocket }}
  tcpSocket:
    port: {{ $componentValues.startupProbe.tcpSocket.port }}
{{- end }}
{{- if $componentValues.startupProbe.grpc }}
  grpc:
    port: {{ $componentValues.startupProbe.grpc.port }}
{{- end }}
  initialDelaySeconds: {{ $componentValues.startupProbe.initialDelaySeconds | default 10 }}
  periodSeconds: {{ $componentValues.startupProbe.periodSeconds | default 10 }}
  timeoutSeconds: {{ $componentValues.startupProbe.timeoutSeconds | default 5 }}
  failureThreshold: {{ $componentValues.startupProbe.failureThreshold | default 30 }}
  successThreshold: {{ $componentValues.startupProbe.successThreshold | default 1 }}
{{- end }}
{{- end }}

{{/*
Redis host.
Usage: {{ include "otel-demo.redis.host" . }}
*/}}
{{- define "otel-demo.redis.host" -}}
{{- printf "%s.%s.svc.%s" .Values.redis.host .Values.global.namespace .Values.global.clusterDomain }}
{{- end }}

{{/*
Redis port.
Usage: {{ include "otel-demo.redis.port" . }}
*/}}
{{- define "otel-demo.redis.port" -}}
{{- .Values.redis.port | default 6379 }}
{{- end }}

{{/*
PostgreSQL host.
Usage: {{ include "otel-demo.postgresql.host" . }}
*/}}
{{- define "otel-demo.postgresql.host" -}}
{{- printf "%s.%s.svc.%s" .Values.postgresql.host .Values.global.namespace .Values.global.clusterDomain }}
{{- end }}

{{/*
PostgreSQL port.
Usage: {{ include "otel-demo.postgresql.port" . }}
*/}}
{{- define "otel-demo.postgresql.port" -}}
{{- .Values.postgresql.port | default 5432 }}
{{- end }}

{{/*
RabbitMQ host.
Usage: {{ include "otel-demo.rabbitmq.host" . }}
*/}}
{{- define "otel-demo.rabbitmq.host" -}}
{{- printf "%s.%s.svc.%s" .Values.rabbitmq.host .Values.global.namespace .Values.global.clusterDomain }}
{{- end }}

{{/*
RabbitMQ port.
Usage: {{ include "otel-demo.rabbitmq.port" . }}
*/}}
{{- define "otel-demo.rabbitmq.port" -}}
{{- .Values.rabbitmq.port | default 5672 }}
{{- end }}

{{/*
OpenTelemetry Collector gRPC endpoint.
Usage: {{ include "otel-demo.collector.grpcEndpoint" . }}
*/}}
{{- define "otel-demo.collector.grpcEndpoint" -}}
{{- if .Values.telemetry.enabled }}
{{- printf "%s.%s.svc.%s:%d" .Values.telemetry.collector.host .Values.global.namespace .Values.global.clusterDomain (.Values.telemetry.collector.grpcPort | int) }}
{{- end }}
{{- end }}

{{/*
OpenTelemetry Collector HTTP endpoint.
Usage: {{ include "otel-demo.collector.httpEndpoint" . }}
*/}}
{{- define "otel-demo.collector.httpEndpoint" -}}
{{- if .Values.telemetry.enabled }}
{{- printf "%s.%s.svc.%s:%d" .Values.telemetry.collector.host .Values.global.namespace .Values.global.clusterDomain (.Values.telemetry.collector.httpPort | int) }}
{{- end }}
{{- end }}

{{/*
Namespace to deploy into.
Usage: {{ include "otel-demo.namespace" . }}
*/}}
{{- define "otel-demo.namespace" -}}
{{- .Values.global.namespace | default .Release.Namespace }}
{{- end }}

{{/*
Image pull secrets.
Usage: {{ include "otel-demo.imagePullSecrets" . }}
*/}}
{{- define "otel-demo.imagePullSecrets" -}}
{{- with .Values.global.image.pullSecrets }}
imagePullSecrets:
{{- range . }}
  - name: {{ . }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Priority class name.
Usage: {{ include "otel-demo.priorityClassName" (dict "ctx" . "component" "cart") }}
*/}}
{{- define "otel-demo.priorityClassName" -}}
{{- $componentValues := index .ctx.Values .component }}
{{- $priorityClassName := .ctx.Values.global.priorityClassName }}
{{- if $componentValues.priorityClassName }}
{{- $priorityClassName = $componentValues.priorityClassName }}
{{- end }}
{{- with $priorityClassName }}
priorityClassName: {{ . }}
{{- end }}
{{- end }}
