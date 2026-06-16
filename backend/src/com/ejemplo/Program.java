package backend.src.com.ejemplo;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

public class Program {

    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);
        
        // Endpoint para la API
        server.createContext("/saludo", new SaludoHandler());
        // Handler para archivos estáticos (wwwroot)
        server.createContext("/", new StaticFileHandler());
        
        server.setExecutor(null);

        System.out.println("Backend iniciado en http://localhost:8080");
        System.out.println("Endpoint: GET /saludo?nombre=Juan");
        server.start();
    }

    static class SaludoHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            // Configurar cabeceras CORS para todas las peticiones
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
            exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, OPTIONS");
            exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");

            // Manejar peticiones de preflight (OPTIONS)
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendResponse(exchange, 405, "Metodo no permitido");
                return;
            }

            Map<String, String> params = parseQuery(exchange.getRequestURI().getRawQuery());
            String nombre = params.getOrDefault("nombre", "mundo");
            String respuesta = "Hola " + nombre + " desde el backend";

            exchange.getResponseHeaders().set("Content-Type", "text/plain; charset=UTF-8");
            sendResponse(exchange, 200, respuesta);
        }

        private static Map<String, String> parseQuery(String query) {
            Map<String, String> params = new HashMap<>();
            if (query == null || query.isEmpty()) {
                return params;
            }

            String[] pairs = query.split("&");
            for (String pair : pairs) {
                String[] keyValue = pair.split("=", 2);
                String key = URLDecoder.decode(keyValue[0], StandardCharsets.UTF_8);
                String value = keyValue.length > 1
                        ? URLDecoder.decode(keyValue[1], StandardCharsets.UTF_8)
                        : "";
                params.put(key, value);
            }
            return params;
        }
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

            // Buscamos el archivo en la carpeta local wwwroot
            Path filePath = Paths.get("wwwroot", normalizedPath);

            if (Files.exists(filePath) && !Files.isDirectory(filePath)) {
                String contentType = getContentType(normalizedPath);
                exchange.getResponseHeaders().set("Content-Type", contentType);
                exchange.sendResponseHeaders(200, Files.size(filePath));
                try (OutputStream os = exchange.getResponseBody()) {
                    Files.copy(filePath, os);
                }
            } else {
                String response = "404 (Not Found): El archivo no existe en wwwroot";
                exchange.sendResponseHeaders(404, response.length());
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(response.getBytes());
                }
            }
        }

        private String getContentType(String path) {
            if (path.endsWith(".html")) return "text/html; charset=UTF-8";
            if (path.endsWith(".css")) return "text/css";
            if (path.endsWith(".js")) return "application/javascript";
            return "text/plain";
        }
    }

        private static void sendResponse(HttpExchange exchange, int statusCode, String body) throws IOException {
            byte[] responseBytes = body.getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(statusCode, responseBytes.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(responseBytes);
            }
        }
}