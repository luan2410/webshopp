package iuh.fit.se.webshop.resources;

import io.swagger.v3.oas.annotations.Operation;
import iuh.fit.se.webshop.models.User;
import iuh.fit.se.webshop.utils.HibernateUtil;
import iuh.fit.se.webshop.utils.SecurityUtils;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.hibernate.Session;
import org.hibernate.Transaction;

import io.swagger.v3.oas.annotations.media.Schema;

@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthResource {

    public static class LoginRequest {
        @Schema(example = "admin")
        public String username;
        @Schema(example = "123456")
        public String password;
    }

    public static class RegisterRequest {
        @Schema(example = "newadmin")
        public String username;
        @Schema(example = "123456")
        public String password;
        @Schema(example = "admin@ltlshop.com")
        public String email;
        @Schema(example = "Admin User")
        public String fullName;
    }

    public static class AuthResponse {
        public String token;
        public String role;
        public AuthResponse(String t, String r) { token = t; role = r; }
        public AuthResponse() {}
    }

    @POST
    @Path("/register")
    @Operation(summary = "Register new user")
    public Response register(RegisterRequest req) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            User existing = session.createQuery("FROM User WHERE username = :u", User.class)
                    .setParameter("u", req.username).uniqueResult();
            if (existing != null) {
                return Response.status(Response.Status.CONFLICT).entity("Tên đăng nhập đã tồn tại").build();
            }

            Transaction tx = session.beginTransaction();
            User user = new User();
            user.setUsername(req.username);
            user.setPassword(SecurityUtils.hashPassword(req.password));
            user.setEmail(req.email != null ? req.email : "");
            user.setFullName(req.fullName != null ? req.fullName : "");
            
            Long count = session.createQuery("SELECT COUNT(u) FROM User u", Long.class).uniqueResult();
            user.setRole(count == 0 ? "ADMIN" : "USER");

            session.persist(user);
            tx.commit();

            String token = SecurityUtils.createToken(user.getUsername(), user.getRole(), user.getId());
            return Response.ok(new AuthResponse(token, user.getRole())).build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().entity("Lỗi server: " + e.getMessage()).build();
        }
    }

    @POST
    @Path("/login")
    @Operation(summary = "Login")
    public Response login(LoginRequest req) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            User user = session.createQuery("FROM User WHERE username = :u", User.class)
                    .setParameter("u", req.username).uniqueResult();
            
            if (user == null || !SecurityUtils.checkPassword(req.password, user.getPassword())) {
                return Response.status(Response.Status.UNAUTHORIZED).entity("Sai tên đăng nhập hoặc mật khẩu").build();
            }

            String token = SecurityUtils.createToken(user.getUsername(), user.getRole(), user.getId());
            return Response.ok(new AuthResponse(token, user.getRole())).build();
        } catch (Exception e) {
             return Response.serverError().entity("Lỗi server").build();
        }
    }
}
