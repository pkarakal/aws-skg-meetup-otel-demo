FROM grafana/k6:1.5.0

# Copy load testing scripts
COPY . /scripts/

WORKDIR /scripts

# Default command runs the main test script
ENTRYPOINT ["k6"]
CMD ["run", "/scripts/main.ts"]
