const opentelemetry = require('@opentelemetry/sdk-node');
const {getNodeAutoInstrumentations} = require('@opentelemetry/auto-instrumentations-node');
const {OTLPTraceExporter} = require('@opentelemetry/exporter-trace-otlp-grpc');
const {awsEc2Detector, awsEksDetector} = require('@opentelemetry/resource-detector-aws');
const {containerDetector} = require('@opentelemetry/resource-detector-container');
const {envDetector, hostDetector, osDetector, processDetector} = require('@opentelemetry/resources');

const {OTEL_EXPORTER_OTLP_ENDPOINT} = process.env

const sdk = new opentelemetry.NodeSDK({
    serviceName: 'frontend',
    traceExporter: new OTLPTraceExporter({
        url: OTEL_EXPORTER_OTLP_ENDPOINT
    }),
    instrumentations: [
        getNodeAutoInstrumentations({
            // disable fs instrumentation to reduce noise
            '@opentelemetry/instrumentation-fs': {
                enabled: false,
            },
        })
    ],
    resourceDetectors: [
        containerDetector,
        envDetector,
        hostDetector,
        osDetector,
        processDetector,
        awsEksDetector,
        awsEc2Detector,
    ],
});

sdk.start();
