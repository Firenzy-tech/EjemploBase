package com.ejemplo;

import com.ejemplo.Handlers.SaludoHandler;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.concurrent.Executors;

public class Program {

    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);

        // Endpoint para la API
        server.createContext("/saludo", new SaludoHandler());
        // Handler para archivos estáticos
        server.createContext("/", new StaticFileHandler());

        // Permite manejar múltiples peticiones concurrentes
        server.setExecutor(Executors.newCachedThreadPool());

        System.out.println("Backend iniciado en http://localhost:8080");
        server.start();
    }

    static class StaticFileHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String path = exchange.getRequestURI().getPath();

            // Limpiar el path para evitar problemas con la raíz del sistema de archivos
            // Si el path es "/" o "", usamos "index.html"
            String normalizedPath = (path.equals("/") || path.isEmpty())
                    ? "index.html"
                    : path.substring(1);

            // Buscamos el archivo en la raíz del proyecto (donde se ejecuta el programa)
            Path filePath = Paths.get(normalizedPath);
            System.out.println("Buscando archivo en: " + filePath.toAbsolutePath());

            if (Files.exists(filePath) && !Files.isDirectory(filePath)) {
                // Usamos normalizedPath para que getContentType reciba "index.html"
                String contentType = getContentType(normalizedPath);
                exchange.getResponseHeaders().set("Content-Type", contentType);
                exchange.sendResponseHeaders(200, Files.size(filePath));
                try (OutputStream os = exchange.getResponseBody()) {
                    Files.copy(filePath, os);
                }
            } else {
                String response = "404 (Not Found): El archivo no existe en el directorio raiz";
                exchange.sendResponseHeaders(404, response.length());
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(response.getBytes());
                }
            }
        }

        private String getContentType(String path) {
            if (path.endsWith(".html"))
                return "text/html; charset=UTF-8";
            if (path.endsWith(".css"))
                return "text/css";
            if (path.endsWith(".js"))
                return "application/javascript";
            return "text/plain";
        }
    }

}