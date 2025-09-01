import React, { useEffect, useState } from 'react';
import useWebRTC, { LOCAL_VIDEO} from '../hooks/useWebRTC.js';
import { useParams } from 'react-router';

function layoutClasses(clientsNumber = 1) {
    // формируем пары по 2, чтобы понять, останется ли один в последнем ряду
    const pairs = Array.from({ length: clientsNumber }).reduce((acc, _n, idx, arr) => {
        if (idx % 2 === 0) {
            acc.push(arr.slice(idx, idx + 2));
        }
        return acc;
    }, []);
    return pairs
        .map((row, rowIndex, arr) => {
            // если последний ряд и в нём только 1 элемент — делаем col-span-2
            if (rowIndex === arr.length - 1 && row.length === 1) {
                return ['col-span-2'];
            }
            // иначе два элемента, оба col-span-1
            return row.map(() => 'col-span-1');
        })
        .flat();
}

const WebChat = () => {
    const { id: roomID } = useParams();
    const { clients, provideMediaRef, toggleMic, isMicMuted, getMicStatus,clientNames } = useWebRTC(roomID);
    const [realTimeStatus, setRealTimeStatus] = useState(false);

    // Проверяем реальное состояние каждую секунду
    useEffect(() => {
        const interval = setInterval(() => {
            if (getMicStatus) {
                setRealTimeStatus(getMicStatus());
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [getMicStatus]);

    const videoLayout = layoutClasses(clients.length);

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
            <div className="w-full max-w-6xl">
                {/* Grid видео */}
                <div className="grid grid-cols-2 gap-4">
                    {clients.map((clientID, index) => (

                        <div
                            className="relative w-full h-64 md:h-80 lg:h-96 bg-black rounded-lg overflow-hidden shadow">
                            <video
                                className="w-full h-full object-cover"
                                autoPlay
                                playsInline
                                muted={clientID === LOCAL_VIDEO}
                                ref={(node) => provideMediaRef(clientID, node)}
                            />
                            <div
                                className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                                {clientID=== LOCAL_VIDEO ? "Ви" :
                                    clientNames[clientID]}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Контролы */}
                <div className="mt-4 flex flex-wrap items-center gap-3">

                    <button
                        onClick={toggleMic}
                        className={`text-white px-4 py-2 rounded-md transition-colors duration-150 ${
                            isMicMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                        }`}
                    >
                        {isMicMuted ? '🔇 Unmute' : '🎤 Mute'}
                    </button>

                    <button
                        onClick={() => {
                            if (getMicStatus) {
                                const status = getMicStatus();
                                console.log('Manual check - real status:', status);
                                setRealTimeStatus(status);
                            }
                        }}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-md"
                    >
                        Check Status
                    </button>

                    {/* Debug info */}
                    <div className="ml-auto text-sm text-gray-600 space-y-1">
                        <div>Hook state isMicMuted = {isMicMuted.toString()}</div>
                        <div>Real-time status = {realTimeStatus.toString()}</div>
                        <div>Status match: {(isMicMuted === realTimeStatus).toString()}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WebChat;
