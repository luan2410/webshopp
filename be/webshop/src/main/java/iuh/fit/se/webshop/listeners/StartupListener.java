package iuh.fit.se.webshop.listeners;

import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;
import jakarta.servlet.annotation.WebListener;

@WebListener
public class StartupListener implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent sce) {
        String contextPath = sce.getServletContext().getContextPath();
        String displayPath = contextPath.isEmpty() ? "/" : contextPath;
        String swaggerUrl = "http://localhost:8080" + contextPath + "/api-docs/index.html";
        
        System.out.println("\n");
        System.out.println("======================================================================");
        System.out.println("[INFO] APP STARTED SUCCESSFULLY");
        System.out.println("[INFO] Context Path: " + displayPath);
        System.out.println("[INFO] Swagger UI:   " + swaggerUrl);
        System.out.println("======================================================================");
        System.out.println("\n");
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
    }
}
