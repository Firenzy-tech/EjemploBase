# Usamos Eclipse Temurin, que es la recomendación actual de la comunidad para Java
FROM eclipse-temurin:17-jdk

# Definimos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos todos los archivos del proyecto al contenedor
COPY . .

# Compilamos el código Java (siguiendo tus notas de compilación)
RUN javac -d bin backend/src/com/ejemplo/Program.java

# Exponemos el puerto en el que corre tu servidor
EXPOSE 8080

# Comando para ejecutar la aplicación
CMD ["java", "-cp", "bin", "com.ejemplo.Program"]