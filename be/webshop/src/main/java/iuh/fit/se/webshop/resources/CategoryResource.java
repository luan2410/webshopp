package iuh.fit.se.webshop.resources;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import iuh.fit.se.webshop.models.Category;
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

@Path("/categories")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CategoryResource {

    @GET
    @Operation(summary = "Get all categories")
    public List<Category> getAll() {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            return session.createQuery("FROM Category", Category.class).list();
        }
    }

    @POST
    @RolesAllowed("ADMIN")
    @Operation(summary = "Create category (Admin)", security = @SecurityRequirement(name = "bearerAuth"))
    public Response create(@Context SecurityContext sc, Category c) {
        if (!sc.isUserInRole("ADMIN")) return Response.status(Response.Status.FORBIDDEN).build();
        
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Transaction tx = session.beginTransaction();
            session.persist(c);
            tx.commit();
            return Response.ok(c).build();
        }
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed("ADMIN")
    @Operation(summary = "Update category (Admin)", security = @SecurityRequirement(name = "bearerAuth"))
    public Response update(@Context SecurityContext sc, @PathParam("id") Long id, Category c) {
        if (!sc.isUserInRole("ADMIN")) return Response.status(Response.Status.FORBIDDEN).build();
        
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Transaction tx = session.beginTransaction();
            Category existing = session.get(Category.class, id);
            if (existing == null) return Response.status(404).build();
            
            existing.setName(c.getName());
            existing.setDescription(c.getDescription());
            session.merge(existing);
            tx.commit();
            return Response.ok(existing).build();
        }
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed("ADMIN")
    @Operation(summary = "Delete category (Admin)", security = @SecurityRequirement(name = "bearerAuth"))
    public Response delete(@Context SecurityContext sc, @PathParam("id") Long id) {
        if (!sc.isUserInRole("ADMIN")) return Response.status(Response.Status.FORBIDDEN).build();
        
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Transaction tx = session.beginTransaction();
            Category c = session.get(Category.class, id);
            if (c != null) {
                session.remove(c);
                tx.commit();
            }
            return Response.ok().build();
        }
    }
}
