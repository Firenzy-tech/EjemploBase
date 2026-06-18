# --- Etapa 1: Build ---
# Usamos una imagen de OpenJDK con el kit de desarrollo (JDK) para compilar el código.
FROM eclipse-temurin:17-jdk-jammy as builder

# Establecemos el directorio de trabajo dentro del contenedor.
WORKDIR /app

# Copiamos solo los archivos fuente del backend necesarios para la compilación.
COPY backend/src/ /app/src/

# Creamos el directorio de salida 'bin' y compilamos el código.
# La clave es usar '-sourcepath src' para que javac encuentre todas las clases.
RUN mkdir -p bin && javac -d bin -sourcepath src src/com/ejemplo/Program.java


# --- Etapa 2: Run ---
# Usamos una imagen más ligera con solo el entorno de ejecución de Java (JRE).
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# Copiamos todos los archivos del frontend (html, css, js) desde el contexto local.
COPY . .

# Copiamos los archivos compilados (.class) desde la etapa 'builder'.
COPY --from=builder /app/bin/ /app/bin/

# Exponemos el puerto en el que corre nuestro servidor.
EXPOSE 8080

# El comando para iniciar la aplicación cuando el contenedor se ejecute.
CMD ["java", "-cp", "bin", "com.ejemplo.Program"]