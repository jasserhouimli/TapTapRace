using Microsoft.AspNetCore.SignalR;

public class RoomHub : Hub
{

    public async Task JoinRoom(string roomId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
        await Clients.Group(roomId).SendAsync("ReceiveMessage", $"{Context.ConnectionId} joined the room {roomId}");
    }

    public async Task SendMessage(string roomId, string message)
    {
        await Clients.Group(roomId).SendAsync("ReceiveMessage", $"{Context.ConnectionId} : {message}");
    }


    public async Task LeaveRoom(string roomId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId);
        await Clients.Group(roomId).SendAsync("ReceiveMessage", $"{Context.ConnectionId} left the room {roomId}");
    }
}
