import {config} from 'dotenv';
import {expand} from 'dotenv-expand';
import { resolve } from 'path';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const myEnv = config({
    path: resolve(__dirname, '.env'),
});

expand(myEnv);

const {
    CATALOG_SERVICE_ADDR = '',
    CART_SERVICE_ADDR = '',
    CHECKOUT_SERVICE_ADDR = '',
    ENV_PLATFORM = '',
    OTEL_EXPORTER_OTLP_ENDPOINT = '',
    OTEL_METRICS_EXPORTER = 'otlp',
    OTEL_TRACES_EXPORTER = 'otlp',
    OTEL_SERVICE_NAME = 'frontend',
    IMAGE_SERVER_PROTOCOL = '',
    IMAGE_SERVER_HOST = '',
    IMAGE_SERVER_PORT = '443',
    IMAGE_SERVER_BUCKET = ''
} = process.env;


const nextConfig = {
    env: {
        CATALOG_SERVICE_ADDR,
        CART_SERVICE_ADDR,
        CHECKOUT_SERVICE_ADDR,
        NEXT_PUBLIC_PLATFORM: ENV_PLATFORM,
        OTEL_EXPORTER_OTLP_ENDPOINT,
        OTEL_SERVICE_NAME,
        OTEL_METRICS_EXPORTER,
        OTEL_TRACES_EXPORTER,
        IMAGE_SERVER_PROTOCOL,
        IMAGE_SERVER_HOST,
        IMAGE_SERVER_PORT,
        IMAGE_SERVER_BUCKET,
        NEXT_PUBLIC_OTEL_SERVICE_NAME: OTEL_SERVICE_NAME,
        NEXT_PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: OTEL_EXPORTER_OTLP_ENDPOINT,
        NEXT_PUBLIC_CART_SERVICE_ADDR: CART_SERVICE_ADDR,
        NEXT_PUBLIC_CHECKOUT_SERVICE_ADDR: CHECKOUT_SERVICE_ADDR
    },
    images: {
        remotePatterns: [
            {
                protocol: `${IMAGE_SERVER_PROTOCOL}`,
                hostname: `${IMAGE_SERVER_HOST}`,
                port: `${IMAGE_SERVER_PORT}`,
                pathname: `/${IMAGE_SERVER_BUCKET}/**`,
            },
        ],
    },
};

export default nextConfig;
