package iuh.fit.se.webshop.resources;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import iuh.fit.se.webshop.models.CartItem;
import iuh.fit.se.webshop.models.Product;
import iuh.fit.se.webshop.models.User;
import iuh.fit.se.webshop.utils.HibernateUtil;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import org.hibernate.Session;
import org.hibernate.Transaction;

import java.security.Principal;
import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;

@Path("/cart")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CartResource {

    public static class AddToCartRequest {
        @Schema(example = "1")
        public Long productId;
        @Schema(example = "1")
        public Integer quantity;
    }

    public static class UpdateQuantityRequest {
        @Schema(example = "2")
        public Integer quantity;
    }

    private Long getCurrentUserId(SecurityContext sc) {
        Principal p = sc.getUserPrincipal();
        if (p == null) return null;
        // In AuthFilter/SecurityUtils, we didn't explicitly store userId in Principal name, just username.
        // But createToken puts "userId" in claims.
        // To be simpler here, we query User by username.
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
             User u = session.createQuery("FROM User WHERE username = :n", User.class)
                     .setParameter("n", p.getName()).uniqueResult();
             return u != null ? u.getId() : null;
        }
    }

    @GET
    @Operation(summary = "Get my cart", security = @SecurityRequirement(name = "bearerAuth"))
    public Response getCart(@Context SecurityContext sc) {
        Long userId = getCurrentUserId(sc);
        if (userId == null) return Response.status(Response.Status.UNAUTHORIZED).build();

        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            List<CartItem> items = session.createQuery("FROM CartItem c WHERE c.user.id = :uid", CartItem.class)
                    .setParameter("uid", userId).list();
            return Response.ok(items).build();
        }
    }

    @POST
    @Operation(summary = "Add to cart", security = @SecurityRequirement(name = "bearerAuth"))
    public Response addToCart(@Context SecurityContext sc, AddToCartRequest req) {
        Long userId = getCurrentUserId(sc);
        if (userId == null) return Response.status(Response.Status.UNAUTHORIZED).build();

        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Transaction tx = session.beginTransaction();
            
            // Check if item exists
            CartItem existing = session.createQuery("FROM CartItem c WHERE c.user.id = :uid AND c.product.id = :pid", CartItem.class)
                    .setParameter("uid", userId)
                    .setParameter("pid", req.productId)
                    .uniqueResult();

            if (existing != null) {
                existing.setQuantity(existing.getQuantity() + req.quantity);
                session.merge(existing);
            } else {
                User u = session.load(User.class, userId);
                Product p = session.load(Product.class, req.productId);
                CartItem newItem = new CartItem(u, p, req.quantity);
                session.persist(newItem);
            }
            
            tx.commit();
            return Response.ok(java.util.Collections.singletonMap("result", "ok")).build();
        } catch (Exception e) {
            return Response.serverError().entity(e.getMessage()).build();
        }
    }
    
    @PUT
    @Path("/{id}")
    @Operation(summary = "Update cart item quantity", security = @SecurityRequirement(name = "bearerAuth"))
    public Response updateQuantity(@Context SecurityContext sc, @PathParam("id") Long id, UpdateQuantityRequest req) {
        Long userId = getCurrentUserId(sc);
        if (userId == null) return Response.status(Response.Status.UNAUTHORIZED).build();

        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Transaction tx = session.beginTransaction();
            CartItem item = session.get(CartItem.class, id);
            
            if (item != null && item.getUser().getId().equals(userId)) {
                if (req.quantity <= 0) {
                    // If quantity is 0 or negative, remove item
                    session.remove(item);
                } else {
                    item.setQuantity(req.quantity);
                    session.merge(item);
                }
            }
            
            tx.commit();
            return Response.ok(java.util.Collections.singletonMap("result", "ok")).build();
        } catch (Exception e) {
            return Response.serverError().entity(e.getMessage()).build();
        }
    }

    @DELETE
    @Path("/{id}")
    @Operation(summary = "Remove cart item", security = @SecurityRequirement(name = "bearerAuth"))
    public Response remove(@Context SecurityContext sc, @PathParam("id") Long id) {
        Long userId = getCurrentUserId(sc); // Ensure ownership
        if (userId == null) return Response.status(Response.Status.UNAUTHORIZED).build();

        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Transaction tx = session.beginTransaction();
            CartItem item = session.get(CartItem.class, id);
            if (item != null && item.getUser().getId().equals(userId)) {
                session.remove(item);
            }
            tx.commit();
            return Response.ok(java.util.Collections.singletonMap("result", "ok")).build();
        }
    }
}
