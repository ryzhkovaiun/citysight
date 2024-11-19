namespace CitySight.Server.Structs
{
    public class LocationInformation
    {
        public string Name { get; set; } = null!;

        public string Type { get; set; } = null!;

        public string Description { get; set; } = null!;

        public IEnumerable<long> ImageIds { get; set; } = null!;

        public string VisitDate { get; set; } = null!;
    }
}
