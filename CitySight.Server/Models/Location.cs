using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CitySight.Server.Models
{
    [Table("locations")]
    public class Location
    {
        [Key]
        public long Id { get; set; }

        [Required]
        public string Icon { get; set; } = null!;

        [Required]
        public string Name { get; set; } = null!;

        [Required]
        public string Type { get; set; } = null!;

        [Required]
        public string Description { get; set; } = null!;

        [Required]
        public double Latitude { get; set; }

        [Required]
        public double Longitude { get; set; }

        [Required]
        public List<long> ImageIds { get; set; } = [];

        public DateOnly? VisitDate { get; set; } = null;
    }
}
