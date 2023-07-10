import React, { useEffect, useRef } from 'react';
import {useSocket} from "../context/SocketProvider";

const Whiteboard = () => {
    const socket = useSocket();

  const canvasRef = useRef(null);
  let ctx;
  let x;
  let y;
  let mouseDown = false;
  
  useEffect(() => {
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
      ctx = canvasRef.current.getContext('2d');

    const handleDraw = ({ x, y }) => {
      ctx.lineTo(x, y);
      ctx.stroke();
    };

    const handleMouseUp = () => {
      mouseDown = false;
    };

    const handleMouseDown = (e) => {
      ctx.moveTo(x, y);
    //   ctx.lineTo(x,y);
    //   ctx.stroke();
    socket.emit('down', { x,y });
      mouseDown = true;
    };

    const handleMouseMove = (e) => {
      x = e.clientX;
      y = e.clientY;
      if (mouseDown) {
        ctx.lineTo(x, y);
        ctx.stroke();
        socket.emit('draw', { x,y });
      }
    };

    const handleDown = ({x,y}) => {
        ctx.moveTo(x,y);
    }
    socket.on('onDraw', handleDraw);
    socket.on('onDown', handleDown);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [socket]);

  return <canvas ref={canvasRef} />;
};

export default Whiteboard;
