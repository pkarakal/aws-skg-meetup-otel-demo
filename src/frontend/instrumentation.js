import {NodeSDK} from '@opentelemetry/sdk-node';
import {getNodeAutoInstrumentations}  from '@opentelemetry/auto-instrumentations-node';
import {OTLPTraceExporter} from '@opentelemetry/exporter-trace-otlp-grpc';
import {awsEc2Detector, awsEksDetector} from '@opentelemetry/resource-detector-aws';
import {containerDetector} from '@opentelemetry/resource-detector-container';
import {envDetector, hostDetector, osDetector, processDetector} from '@opentelemetry/resources';

const {OTEL_EXPORTER_OTLP_ENDPOINT} = process.env

const sdk = new NodeSDK({
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
