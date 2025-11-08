package iuh.fit.se.webshop.resources;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import iuh.fit.se.webshop.models.Product;
import iuh.fit.se.webshop.utils.HibernateUtil;
import jakarta.annotation.security.RolesAllowed;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import org.hibernate.Session;
import org.hibernate.Transaction;

import java.util.List;

@Path("/products")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ProductResource {

    @GET
    @Operation(summary = "Get all products")
    public List<Product> getAll() {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            return session.createQuery("FROM Product", Product.class).list();
        }
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "Get product by ID")
    public Response getOne(@PathParam("id") Long id) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Product p = session.get(Product.class, id);
            if (p == null) return Response.status(404).build();
            return Response.ok(p).build();
        }
    }

    @POST
    @RolesAllowed("ADMIN")
    @Operation(summary = "Create product (Admin only)", security = @SecurityRequirement(name = "bearerAuth"))
    public Response create(@Context SecurityContext sc, Product p) {
        // Double check role
        if (!sc.isUserInRole("ADMIN")) return Response.status(Response.Status.FORBIDDEN).build();
        
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Transaction tx = session.beginTransaction();
            session.persist(p);
            tx.commit();
            return Response.ok(p).build();
        } catch (Exception e) {
            return Response.serverError().entity(e.getMessage()).build();
        }
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed("ADMIN")
    @Operation(summary = "Update product (Admin only)", security = @SecurityRequirement(name = "bearerAuth"))
    public Response update(@Context SecurityContext sc, @PathParam("id") Long id, Product p) {
        if (!sc.isUserInRole("ADMIN")) return Response.status(Response.Status.FORBIDDEN).build();

        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Transaction tx = session.beginTransaction();
            Product existing = session.get(Product.class, id);
            if (existing == null) return Response.status(404).build();
            
            existing.setName(p.getName());
            existing.setPrice(p.getPrice());
            existing.setDescription(p.getDescription());
            existing.setImage(p.getImage());
            existing.setCategory(p.getCategory()); // Assuming category object is valid or managed
            
            session.merge(existing);
            tx.commit();
            return Response.ok(existing).build();
        }
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed("ADMIN")
    @Operation(summary = "Delete product (Admin only)", security = @SecurityRequirement(name = "bearerAuth"))
    public Response delete(@Context SecurityContext sc, @PathParam("id") Long id) {
        if (!sc.isUserInRole("ADMIN")) return Response.status(Response.Status.FORBIDDEN).build();
        
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Transaction tx = session.beginTransaction();
            Product p = session.get(Product.class, id);
            if (p != null) {
                session.remove(p);
                tx.commit();
            }
            return Response.ok().build();
        }
    }
}
