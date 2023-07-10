import React, { useCallback, useEffect, useState } from 'react'
import {useSocket} from "../context/SocketProvider"
import {useNavigate} from "react-router-dom"
import { Pages } from './Pages';
export const Home = () => {

    const socket = useSocket();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [roomNumber, setRoomNumber] = useState("");
    const [showStream, setShowStream] = useState(false);
    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        socket.emit('user:request', { email, roomNumber });
        console.log(email, roomNumber);
    }, [socket, email, roomNumber]);

    const handleUserJoined = useCallback((data) => {
        const { email,roomNumber } = data;
        console.log("as", email, roomNumber);
        // setShowStream(true);
        navigate(`/room/${roomNumber}`);
    }, [navigate]);

    useEffect(() => {
        socket.on('user:joined', handleUserJoined)
        // socket.on('user', () => {alert('sd');})
        return () => {
            socket.off('user:joined', handleUserJoined)
        }
    }, [socket, handleUserJoined]);
    return (
        <div>
            <h1>Lobby</h1>
            <form onSubmit={handleSubmit}>
                <input type="text" name="username" value={email} onChange={(e) => setEmail(e.target.value)}
                    id="username" />
                <br />
                <input type="text" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} name="roomNumber" id="roomNumber" />
                <br />
                <button>Join</button>
            </form>

            {/* {
                showStream &&
                <Pages/>
            } */}
        </div>
    )
}
