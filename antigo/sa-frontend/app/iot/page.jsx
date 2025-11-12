"use client";
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export default function IotDashboard(){
  const [telemetry, setTelemetry] = useState([]);

//   useEffect(()=>{
//     const socket = io('http://localhost:4000/iot');
//     socket.on('connect', ()=> console.log('connected to iot'));
//     socket.on('telemetry', (data)=>{
//       setTelemetry((s)=> [data, ...s].slice(0,50));
//     });
//     return ()=> socket.disconnect();
//   },[]);

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">IoT Dashboard</h1>
      <div className="space-y-2">
        {telemetry.map((t, i)=> (
          <div key={i} className="p-2 border rounded text-sm">{JSON.stringify(t)}</div>
        ))}
      </div>
    </div>
  );
}
