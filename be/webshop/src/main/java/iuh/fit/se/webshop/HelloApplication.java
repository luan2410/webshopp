package iuh.fit.se.webshop;

import io.swagger.v3.jaxrs2.integration.JaxrsOpenApiContextBuilder;
import io.swagger.v3.jaxrs2.integration.resources.OpenApiResource;
import io.swagger.v3.oas.integration.SwaggerConfiguration;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import iuh.fit.se.webshop.filter.AuthFilter;
import iuh.fit.se.webshop.resources.*;
import jakarta.ws.rs.ApplicationPath;
import jakarta.ws.rs.core.Application;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@ApplicationPath("/api")
public class HelloApplication extends Application {
    public HelloApplication() {
        OpenAPI oas = new OpenAPI();
        Info info = new Info()
                .title("LTL Shop API (Java)")
                .description("Java Backend for Webshop (MariaDB)")
                .version("1.0.0");
        
        oas.info(info);
        // Cấu hình Server URL trỏ về root context path của ứng dụng
        // Swagger sẽ tự động ghép thêm @ApplicationPath("/api") vào sau
        oas.setServers(List.of(new Server().url("/webshop").description("Local Server")));
        
        oas.components(new Components().addSecuritySchemes("bearerAuth",
                new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("JWT")));
        
        SwaggerConfiguration oasConfig = new SwaggerConfiguration()
                .openAPI(oas)
                .prettyPrint(true)
                .resourcePackages(Stream.of("iuh.fit.se.webshop.resources").collect(Collectors.toSet()));

        try {
            new JaxrsOpenApiContextBuilder<>()
                    .servletConfig(null)
                    .application(this)
                    .openApiConfiguration(oasConfig)
                    .buildContext(true);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public Set<Class<?>> getClasses() {
        Set<Class<?>> classes = new HashSet<>();
        classes.add(HelloResource.class);
        classes.add(AuthResource.class);
        classes.add(ProductResource.class);
        classes.add(CategoryResource.class);
        classes.add(CartResource.class);
        classes.add(OrderResource.class);
        classes.add(AuthFilter.class);
        classes.add(OpenApiResource.class);
        return classes;
    }
}