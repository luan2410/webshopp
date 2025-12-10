package iuh.fit.se.webshop;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "iuh.fit.se.webshop.repositories")
public class WebshopApplication {
    public static void main(String[] args) {
        SpringApplication.run(WebshopApplication.class, args);
    }
}
