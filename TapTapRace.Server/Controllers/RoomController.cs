using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using TapTapRace.Server.Models;
namespace TapTapRace.Server.Controllers
{
    [ApiController]
    [Route("/api/[controller]")]
    public class RoomController : Controller
    {
        private static readonly ConcurrentDictionary<string, Room> _rooms = new();

        private readonly IHubContext<RoomHub> _hubContext;

        public RoomController(IHubContext<RoomHub> hubContext)
        {
            _hubContext = hubContext;
        }

        [HttpGet("getRooms")]
        public ActionResult GetRoom()
        {
            return Ok(_rooms.Values);
        }

        [HttpPost("createRoom")]
        public async Task<ActionResult> CreateRoom([FromBody] CreateRoomRequest request)
        {
            if (string.IsNullOrEmpty(request.Name))
            {
                return BadRequest("Name is required");
            }

            var room = new Room(request.Name);
            _rooms.TryAdd(room.Id, room);
            await _hubContext.Clients.All.SendAsync("RoomCreated", room);
            return Ok(new { Message = "Room created", RoomId = room.Id });
        }

        [HttpGet("JoinRoom")]
        public ActionResult JoinRoom(string RoomId)
        {
            if (_rooms.TryGetValue(RoomId, out Room room))
            {
                return Ok(room);
            }
            else
            {
                return BadRequest("Room Not Found");
            }
        }
    }
}
