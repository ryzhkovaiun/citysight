using System.Text.Json.Serialization;

namespace CitySight.Server.Structs
{
    public class NewLocation
    {
        [JsonPropertyName("name")]
        public string Name { get; set; } = null!;

        [JsonPropertyName("type")]
        public string Type { get; set; } = null!;

        [JsonPropertyName("latitude")]
        public double Latitude { get; set; } = 0.0;

        [JsonPropertyName("longitude")]
        public double Longitude { get; set; } = 0.0;
    }
}
