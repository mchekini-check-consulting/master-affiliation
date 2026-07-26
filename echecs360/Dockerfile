# Étape 1 : build Maven (le pom.xml est copié seul d'abord pour mettre
# les dépendances en cache : elles ne sont retéléchargées que s'il change)
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q dependency:go-offline
COPY src ./src
RUN mvn -q package -DskipTests

# Étape 2 : JRE léger, utilisateur non-root
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S spring && adduser -S spring -G spring \
    && mkdir -p /data && chown spring:spring /data
USER spring
COPY --from=build /app/target/*.jar app.jar
ENV DATA_DIR=/data
EXPOSE 8095
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:8095/actuator/health | grep -q '"UP"' || exit 1
ENTRYPOINT ["java", "-jar", "app.jar"]
