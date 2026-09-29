FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

RUN useradd --system --create-home appuser

COPY product-service.jar app.jar

USER appuser

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]