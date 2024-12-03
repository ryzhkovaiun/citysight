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

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] NewLocation newLocation)
        {
            Location location = new ()
            {
                Icon = "tree-city",
                Name = newLocation.Name,
                Type = newLocation.Type,
                Description = string.Empty,
                Latitude = newLocation.Latitude,
                Longitude = newLocation.Longitude
            };

            await dbContext.Locations.AddAsync(location);
            await dbContext.SaveChangesAsync();

            return Ok(new { location.Id });
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
        public async Task<ActionResult<string>> UpdateDescription(long id)
        {
            var location = await dbContext.Locations.FindAsync(id);

            if (location is null)
            {
                return NotFound();
            }

            using (var reader = new StreamReader(HttpContext.Request.Body))
            {
                location.Description = await reader.ReadToEndAsync();
                location.VisitDate ??= DateOnly.FromDateTime(DateTime.Now);
            }

            await dbContext.SaveChangesAsync();

            return location.VisitDate.Value.ToString("D", _culture);
        }
    }
}
