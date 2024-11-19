namespace CitySight.Server.Structs
{
    public class LocationCoordinates
    {
        public long Id { get; set; } = 0;

        public string Icon { get; set; } = null!;

        public string Name { get; set; } = null!;

        public double Latitude { get; set; } = 0.0;

        public double Longitude { get; set; } = 0.0;

        public bool Visited { get; set; } = false;
    }
}
