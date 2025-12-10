package iuh.fit.se.webshop.resources;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import iuh.fit.se.webshop.models.*;
import iuh.fit.se.webshop.utils.HibernateUtil;
import jakarta.annotation.security.RolesAllowed;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import org.hibernate.Session;
import org.hibernate.Transaction;

import java.security.Principal;
import java.util.Date;
import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;

@Path("/orders")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class OrderResource {

    public static class CreateOrderRequest {
        @Schema(example = "123 Đường Nguyễn Huệ, Quận 1, TP.HCM")
        public String shippingAddress;
    }

    public static class UpdateStatusRequest {
        @Schema(example = "Shipping")
        public String status;
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

    @POST
    @Operation(summary = "Checkout (Create order from cart)", security = @SecurityRequirement(name = "bearerAuth"))
    public Response checkout(@Context SecurityContext sc, CreateOrderRequest req) {
        Long userId = getCurrentUserId(sc);
        if (userId == null) return Response.status(Response.Status.UNAUTHORIZED).build();

        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Transaction tx = session.beginTransaction();

            // Get Cart
            List<CartItem> cartItems = session.createQuery("FROM CartItem c WHERE c.user.id = :uid", CartItem.class)
                    .setParameter("uid", userId).list();
            
            if (cartItems.isEmpty()) return Response.status(Response.Status.BAD_REQUEST).entity("Cart empty").build();

            User user = session.get(User.class, userId);
            
            Order order = new Order();
            order.setUser(user);
            order.setOrderDate(new Date());
            order.setStatus("Paid"); // Default to Paid
            order.setShippingAddress(req.shippingAddress);
            
            // Generate random 6-char code
            String code = java.util.UUID.randomUUID().toString().substring(0, 6).toUpperCase();
            order.setCode(code);
            
            double total = 0;
            for (CartItem ci : cartItems) {
                OrderItem oi = new OrderItem(order, ci.getProduct(), ci.getQuantity(), ci.getProduct().getPrice());
                order.getItems().add(oi);
                total += ci.getProduct().getPrice() * ci.getQuantity();
            }
            order.setTotalAmount(total);

            session.persist(order);

            // Clear Cart
            for (CartItem ci : cartItems) session.remove(ci);

            tx.commit();
            return Response.ok(order).build();
        }
    }

    @GET
    @Operation(summary = "Get my orders (User) or All (Admin)", security = @SecurityRequirement(name = "bearerAuth"))
    public Response getOrders(
            @Context SecurityContext sc,
            @QueryParam("startDate") String startDateStr,
            @QueryParam("endDate") String endDateStr) {
        Long userId = getCurrentUserId(sc);
        if (userId == null) return Response.status(Response.Status.UNAUTHORIZED).build();

        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            String baseQuery = sc.isUserInRole("ADMIN") 
                ? "FROM Order WHERE 1=1" 
                : "FROM Order WHERE user.id = :uid";
            
            // Add date filters if provided
            if (startDateStr != null && !startDateStr.isEmpty()) {
                baseQuery += " AND orderDate >= :startDate";
            }
            if (endDateStr != null && !endDateStr.isEmpty()) {
                baseQuery += " AND orderDate <= :endDate";
            }
            baseQuery += " ORDER BY orderDate DESC";
            
            var query = session.createQuery(baseQuery, Order.class);
            
            if (!sc.isUserInRole("ADMIN")) {
                query.setParameter("uid", userId);
            }
            
            if (startDateStr != null && !startDateStr.isEmpty()) {
                try {
                    Date startDate = new java.text.SimpleDateFormat("yyyy-MM-dd").parse(startDateStr);
                    query.setParameter("startDate", startDate);
                } catch (Exception e) {
                    return Response.status(Response.Status.BAD_REQUEST).entity("Invalid startDate format. Use yyyy-MM-dd").build();
                }
            }
            
            if (endDateStr != null && !endDateStr.isEmpty()) {
                try {
                    Date endDate = new java.text.SimpleDateFormat("yyyy-MM-dd").parse(endDateStr);
                    // Set to end of day
                    endDate = new Date(endDate.getTime() + 24 * 60 * 60 * 1000 - 1);
                    query.setParameter("endDate", endDate);
                } catch (Exception e) {
                    return Response.status(Response.Status.BAD_REQUEST).entity("Invalid endDate format. Use yyyy-MM-dd").build();
                }
            }
            
            List<Order> orders = query.list();
            return Response.ok(orders).build();
        }
    }

    @PUT
    @Path("/{id}/status")
    @RolesAllowed("ADMIN")
    @Operation(summary = "Update order status (Admin)", security = @SecurityRequirement(name = "bearerAuth"))
    public Response updateStatus(@Context SecurityContext sc, @PathParam("id") Long id, UpdateStatusRequest req) {
        if (!sc.isUserInRole("ADMIN")) return Response.status(Response.Status.FORBIDDEN).build();
        
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Transaction tx = session.beginTransaction();
            Order order = session.get(Order.class, id);
            if (order == null) return Response.status(404).build();
            
            order.setStatus(req.status);
            session.merge(order);
            tx.commit();
            return Response.ok(order).build();
        }
    }
}
