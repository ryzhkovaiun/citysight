using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using CitySight.Server.Structs;
using CitySight.Server.Models;
using System.Globalization;

namespace CitySight.Server.Controllers
{
    [ApiController]
    [Route("/api/locations")]
    public class LocationsController(CitySightDbContext dbContext) : ControllerBase
    {
        private readonly CultureInfo _culture = CultureInfo.CreateSpecificCulture("ru-RU");

        [HttpGet]
        public async Task<IEnumerable<LocationCoordinates>> Get()
        {
            static LocationCoordinates ToCoordinates(Location location) => new()
            {
                Id = location.Id,
                Icon = location.Icon,
                Name = location.Name,
                Latitude = location.Latitude,
                Longitude = location.Longitude,
                Visited = location.VisitDate.HasValue
            };

            return (await dbContext.Locations.ToListAsync()).Select(ToCoordinates);
        }

        [Route("{id}")]
        [HttpGet]
        public async Task<ActionResult<LocationInformation>> GetInformation(long id)
        {
            var location = await dbContext.Locations.FindAsync(id);

            if (location is null)
            {
                return NotFound();
            }

            return new LocationInformation()
            {
                Name = location.Name,
                Type = location.Type,
                Description = location.Description,
                ImageIds = location.ImageIds,
                VisitDate = location.VisitDate?.ToString("D", _culture) ?? "Никогда"
            };
        }

        [Route("{id}")]
        [HttpPatch]
        public async Task<ActionResult> UpdateDescription(long id)
        {
            var location = await dbContext.Locations.FindAsync(id);

            if (location is null)
            {
                return NotFound();
            }

            using (var reader = new StreamReader(HttpContext.Request.Body))
            {
                location.Description = await reader.ReadToEndAsync();
            }

            await dbContext.SaveChangesAsync();

            return NoContent();
        }
    }
}
