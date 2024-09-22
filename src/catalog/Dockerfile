FROM amazoncorretto:22-jdk as builder

WORKDIR /usr/src/app/

COPY gradlew gradlew
COPY gradle gradle
COPY build.gradle settings.gradle ./

RUN dnf install -y findutils &&  ./gradlew dependencies --no-daemon

COPY . .
RUN ./gradlew clean build -x test --no-daemon


FROM amazoncorretto:22-headless as final
WORKDIR /usr/src/app/
COPY --from=builder /usr/src/app/build/libs/*.jar ./

ARG version=2.8.0
ADD --chmod=644 https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/download/v$version/opentelemetry-javaagent.jar /usr/src/app/opentelemetry-javaagent.jar
ENV JAVA_TOOL_OPTIONS=-javaagent:/usr/src/app/opentelemetry-javaagent.jar
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/usr/src/app/catalog-0.0.1-SNAPSHOT.jar"]
