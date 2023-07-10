import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useSocket } from '../context/SocketProvider';
import peer from '../service/peer';
import ReactPlayer from 'react-player';
import Whiteboard from "../comps/WhiteBoard"

export const Pages = () => {
  const socket = useSocket();
  const [remoteUserId, setRemoteUserId] = useState('');
  const [mystream, setMystream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const handleUser = useCallback(({ email, id }) => {
    console.log('user joined: ', id);
    setRemoteUserId(id);
  }, []);

  const handleUserCall = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    const offer = await peer.getOffer();
    socket.emit('user:call', { to: remoteUserId, offer });
    setMystream(stream);
  }, [remoteUserId, socket]);

  const handleIncommingCall = useCallback(async ({ from, offer }) => {
    console.log(`Incomming call: ${from} ${offer}`);
    setRemoteUserId(from);

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    console.log('stream: ', stream);
    setMystream(stream);
    const answer = await peer.getAnswer(offer);
    socket.emit('call:accepted', { to: from, answer });
  }, [socket]);

  const sendStream = useCallback(() => {
    for (const track of mystream.getTracks()) {
      peer.peer.addTrack(track, mystream);
    }
  }, [mystream]);

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit('peer:nego:needed', { offer, to: remoteUserId });
  }, [remoteUserId, socket]);

  const handleCallAccepted = useCallback(({ from, answer }) => {
    peer.setLocalDesc(answer);
    console.log('call made');
    sendStream();
  }, [sendStream]);

  const handleNegoIncomming = useCallback(async ({ from, offer }) => {
    const ans = await peer.getAnswer(offer);
    socket.emit('peer:nego:done', { to: from, ans });
  }, [socket]);

  const handleNegoFinal = useCallback(async ({ from, ans }) => {
    await peer.setLocalDesc(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener('negotiationneeded', handleNegoNeeded);

    return () => {
      peer.peer.removeEventListener('negotiationneeded', handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  useEffect(() => {
    peer.peer.addEventListener('track', async (e) => {
      const remoteStream = e.streams;
      console.log('GOT THE TRACKS');
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    socket.on('user:join', handleUser);
    socket.on('incomming:call', handleIncommingCall);
    socket.on('call:accepted', handleCallAccepted);
    socket.on('peer:nego:needed', handleNegoIncomming);
    socket.on('peer:nego:final', handleNegoFinal);
    return () => {
      socket.off('user:join', handleUser);
      socket.off('incomming:call', handleIncommingCall);
      socket.off('call:accepted', handleCallAccepted);
      socket.off('peer:nego:needed', handleNegoIncomming);
      socket.off('peer:nego:final', handleNegoFinal);
    };
  }, [
    socket,
    handleUser,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoIncomming,
    handleNegoFinal,
  ]);

  return (
    <div>
      <button className="send-stream-btn" onClick={sendStream}>
        Send Stream
      </button>
      {remoteUserId && (
        <button onClick={handleUserCall}>Call</button>
      )}
      {mystream && (
        <ReactPlayer
          playing
          muted
          height="200px"
          width="200px"
          url={mystream}
        />
      )}
      {remoteStream && (
        <ReactPlayer
          playing
          height="200px"
          width="200px"
          url={remoteStream}
        />
      )}
      <Whiteboard/>
    </div>
  );
};
