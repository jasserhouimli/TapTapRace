namespace TapTapRace.Server.Models
{
    public class Room
    {
        public string Id { get; } = Guid.NewGuid().ToString();
        public string Name { get; }

        public Room(string name)
        {
            Name = name;
        }
    }
    public class CreateRoomRequest
    {
        public string Name { get; set; } = string.Empty;



    }
}
