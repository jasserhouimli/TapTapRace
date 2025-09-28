import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import "./App.css";
import ReactComponent from "./ReactComponent"
interface Room {
    id: string;
    name: string;
}

function App() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
    const [message, setMessage] = useState("");
    const [chatMessages, setChatMessages] = useState<string[]>([]);
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
    const [roomName, setRoomName] = useState<string>("");
    useEffect(() => {

        fetch("http://localhost:5108/api/Room/getRooms")
            .then(res => res.json())
            .then((data: Room[]) => setRooms(data))
            .catch(err => console.error("Failed to load rooms:", err));

        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl("http://localhost:5108/roomhub", { withCredentials: true })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.None)
            .build();

        setConnection(newConnection);

        newConnection.start()
            .then(() => console.log("Connected to RoomHub"))
            .catch(err => console.error(err));

    
        newConnection.on("RoomCreated", (room: Room) => {
            setRooms(prev => [...prev, room]);
        });

        newConnection.on("ReceiveMessage", (msg: string) => {
            setChatMessages(prev => [...prev, msg]);
        });

        return () => {
            newConnection.stop();
        };
    }, []);

    const joinRoom = (roomId: string) => {
        if (connection) {
            connection.invoke("JoinRoom", roomId);
            setSelectedRoom(roomId);
            setChatMessages([]);
        }
    };

    const sendMessage = () => {
        if (connection && selectedRoom && message.trim() !== "") {
            connection.invoke("SendMessage", selectedRoom, message);
            setMessage("");
        }
    };

    const leaveRoom = () => {
        if (connection && selectedRoom) {
            connection.invoke("LeaveRoom", selectedRoom);
            setSelectedRoom(null);
        }

    };

    const createRoom = (_name: string) => {
        fetch("http://localhost:5108/api/Room/createRoom", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: _name,
            })
        })
    }




    return (

        <>
        <ReactComponent />
            
        <div className="App">
           
            <h1>TapTapRace Rooms</h1>


                <input onChange={(e) => setRoomName(e.target.value) }></input>

                <button onClick={() => createRoom(roomName)}>CreateRoom</button>
            <div>
                <h2>Available Rooms</h2>
                <ul>
                    {rooms.map(room => (
                        <li key={room.id}>
                            {room.name}{" "}
                            <button onClick={() => joinRoom(room.id)}>Join</button>
                        </li>
                    ))}
                </ul>
            </div>

            {selectedRoom && (
                <div  style={{ marginTop: "20px" }}>
                    <h2>Room: {selectedRoom}</h2>
                    <div style={{ border: "1px solid gray", padding: "10px", height: "200px", overflowY: "scroll" }}>
                        {chatMessages.map((msg, idx) => (
                            <div key={idx}>{msg}</div>
                        ))}
                    </div>
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                    />
                        <button onClick={sendMessage}>Send</button>
                        <button onClick={leaveRoom }>Leave</button>
                </div>
            )}
        </div>
        </>
    );
}

export default App;
