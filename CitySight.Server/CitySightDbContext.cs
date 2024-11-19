using Microsoft.EntityFrameworkCore;

using CitySight.Server.Models;

namespace CitySight.Server
{
    public class CitySightDbContext(DbContextOptions<CitySightDbContext> options) : DbContext(options)
    {
        public DbSet<Location> Locations { get; set; }
    }
}
