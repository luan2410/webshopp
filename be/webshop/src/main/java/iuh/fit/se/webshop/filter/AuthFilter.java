package iuh.fit.se.webshop.filter;

import io.jsonwebtoken.Claims;
import iuh.fit.se.webshop.utils.SecurityUtils;
import jakarta.annotation.Priority;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import jakarta.ws.rs.ext.Provider;

import java.io.IOException;
import java.security.Principal;

@Provider
@Priority(Priorities.AUTHENTICATION)
public class AuthFilter implements ContainerRequestFilter {

    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        String authHeader = requestContext.getHeaderString("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            Claims claims = SecurityUtils.validateToken(token);
            if (claims != null) {
                final String username = claims.getSubject();
                final String role = claims.get("role", String.class);
                
                requestContext.setSecurityContext(new SecurityContext() {
                    @Override
                    public Principal getUserPrincipal() { return () -> username; }
                    @Override
                    public boolean isUserInRole(String r) { return r.equals(role); }
                    @Override
                    public boolean isSecure() { return requestContext.getUriInfo().getRequestUri().getScheme().equals("https"); }
                    @Override
                    public String getAuthenticationScheme() { return "Bearer"; }
                });
            }
        }
    }
}
