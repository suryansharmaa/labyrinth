# Use an official Java runtime as a parent image
FROM eclipse-temurin:17-jdk-jammy

# Set the working directory inside the container
WORKDIR /app

# Copy the backend files into the container
COPY . .

# Ensure the Maven wrapper is executable and build the project
RUN chmod +x ./mvnw
RUN ./mvnw clean package -DskipTests

# Expose the port Spring Boot runs on
EXPOSE 8080

# Run the generated .jar file (using a wildcard so you don't have to guess the exact version name)
CMD ["sh", "-c", "java -jar target/*.jar"]