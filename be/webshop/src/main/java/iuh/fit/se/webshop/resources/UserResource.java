package iuh.fit.se.webshop.resources;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import iuh.fit.se.webshop.models.User;
import iuh.fit.se.webshop.utils.HibernateUtil;
import iuh.fit.se.webshop.utils.SecurityUtils;
import jakarta.annotation.security.RolesAllowed;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import org.hibernate.Session;
import org.hibernate.Transaction;
import io.swagger.v3.oas.annotations.media.Schema;

import java.security.Principal;
import java.util.List;

@Path("/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UserResource {

    public static class ChangePasswordRequest {
        @Schema(example = "oldPassword")
        public String oldPassword;
        @Schema(example = "newPassword")
        public String newPassword;
    }

    public static class UpdateProfileRequest {
        @Schema(example = "user@example.com")
        public String email;
        @Schema(example = "Nguyen Van A")
        public String fullName;
    }

    public static class AdminUpdateUserRequest {
        @Schema(example = "user@example.com")
        public String email;
        @Schema(example = "Nguyen Van A")
        public String fullName;
        @Schema(example = "USER")
        public String role;
    }

    private Long getCurrentUserId(SecurityContext sc) {
        Principal p = sc.getUserPrincipal();
        if (p == null) return null;
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
             User u = session.createQuery("FROM User WHERE username = :n", User.class)
                     .setParameter("n", p.getName()).uniqueResult();
             return u != null ? u.getId() : null;
        }
    }

    @GET
    @RolesAllowed("ADMIN")
    @Operation(summary = "Get all users (Admin only)", security = @SecurityRequirement(name = "bearerAuth"))
    public List<User> getAll(@Context SecurityContext sc) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            return session.createQuery("FROM User", User.class).list();
        }
    }

    @GET
    @Path("/profile")
    @Operation(summary = "Get my profile", security = @SecurityRequirement(name = "bearerAuth"))
    public Response getProfile(@Context SecurityContext sc) {
        Long userId = getCurrentUserId(sc);
        if (userId == null) return Response.status(Response.Status.UNAUTHORIZED).build();

        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            User u = session.get(User.class, userId);
            // Hide password
            u.setPassword(null);
            return Response.ok(u).build();
        }
    }

    @PUT
    @Path("/profile")
    @Operation(summary = "Update my profile", security = @SecurityRequirement(name = "bearerAuth"))
    public Response updateProfile(@Context SecurityContext sc, UpdateProfileRequest req) {
        Long userId = getCurrentUserId(sc);
        if (userId == null) return Response.status(Response.Status.UNAUTHORIZED).build();

        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Transaction tx = session.beginTransaction();
            User user = session.get(User.class, userId);
            if (user == null) return Response.status(404).build();

            if (req.email != null) user.setEmail(req.email);
            if (req.fullName != null) user.setFullName(req.fullName);
            
            session.merge(user);
            tx.commit();
            
            user.setPassword(null);
            return Response.ok(user).build();
        }
    }

    @PUT
    @Path("/{id}/password")
    @Operation(summary = "Change password", security = @SecurityRequirement(name = "bearerAuth"))
    public Response changePassword(@Context SecurityContext sc, @PathParam("id") Long id, ChangePasswordRequest req) {
        Long currentUserId = getCurrentUserId(sc);
        if (currentUserId == null) return Response.status(Response.Status.UNAUTHORIZED).build();

        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            User user = session.get(User.class, id);
            if (user == null) return Response.status(404).build();

            boolean isAdmin = sc.isUserInRole("ADMIN");
            boolean isSelf = user.getId().equals(currentUserId);

            if (!isAdmin && !isSelf) {
                return Response.status(Response.Status.FORBIDDEN).build();
            }

            // Verify old password if self
            if (isSelf && !isAdmin) {
                if (req.oldPassword == null || !SecurityUtils.checkPassword(req.oldPassword, user.getPassword())) {
                    return Response.status(Response.Status.BAD_REQUEST).entity("Mật khẩu cũ không đúng").build();
                }
            }

            Transaction tx = session.beginTransaction();
            user.setPassword(SecurityUtils.hashPassword(req.newPassword));
            session.merge(user);
            tx.commit();

            return Response.ok(new java.util.HashMap<String, String>() {{
                put("message", "Đổi mật khẩu thành công");
            }}).build();
        }
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed("ADMIN")
    @Operation(summary = "Update user (Admin only)", security = @SecurityRequirement(name = "bearerAuth"))
    public Response updateUser(@Context SecurityContext sc, @PathParam("id") Long id, AdminUpdateUserRequest req) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Transaction tx = session.beginTransaction();
            User user = session.get(User.class, id);
            if (user == null) {
                tx.rollback();
                return Response.status(404).entity("User not found").build();
            }

            // Update fields if provided
            if (req.email != null && !req.email.trim().isEmpty()) {
                user.setEmail(req.email);
            }
            if (req.fullName != null && !req.fullName.trim().isEmpty()) {
                user.setFullName(req.fullName);
            }
            if (req.role != null && (req.role.equals("USER") || req.role.equals("ADMIN"))) {
                user.setRole(req.role);
            }
            
            session.merge(user);
            tx.commit();
            
            user.setPassword(null);
            return Response.ok(user).build();
        } catch (Exception e) {
            return Response.serverError().entity(e.getMessage()).build();
        }
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed("ADMIN")
    @Operation(summary = "Delete user (Admin only)", security = @SecurityRequirement(name = "bearerAuth"))
    public Response delete(@Context SecurityContext sc, @PathParam("id") Long id) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Transaction tx = session.beginTransaction();
            User user = session.get(User.class, id);
            if (user != null) {
                session.remove(user);
                tx.commit();
            }
            return Response.ok().build();
        }
    }
}
