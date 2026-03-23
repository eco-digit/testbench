# Build stage
FROM gradle:8.5-jdk21 AS build
WORKDIR /home/gradle/project

COPY gradlew ./
COPY gradle ./gradle
COPY build.gradle* settings.gradle* ./

RUN chmod +x gradlew

# cache dependencies first
RUN ./gradlew --no-daemon dependencies || true

COPY . .
RUN ./gradlew --no-daemon clean build

# Runtime stage
FROM eclipse-temurin:21-jre

WORKDIR /app

#COPY ./build/libs/ECO-DIGIT-Yusuf-*.jar /app/ecodigit-yusuf.jar
COPY --from=build /home/gradle/project/build/libs/ECO-DIGIT-Yusuf-*.jar /app/ecodigit-yusuf.jar

ENTRYPOINT ["java", "-jar", "/app/ecodigit-yusuf.jar"]
