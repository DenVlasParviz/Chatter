import {useCallback, useEffect, useRef, useState} from "react";
import useStateWithCallback from "./useStateWithCallback.js";
import freeice from "freeice";
import socket from "../../lib/socket.js";
import {ACTIONS} from '../../lib/actions.js';
import {useUser} from "@clerk/clerk-react";

export const LOCAL_VIDEO = 'LOCAL_VIDEO';

export default function useWebRTC(roomID) {
    const [clients, updateClients] = useStateWithCallback([]);
    const [isMicMuted, setIsMicMuted] = useState(false);
    const [name, setName] = useState('');
    const [clientNames, setClientNames] = useState({ [LOCAL_VIDEO]: '' });

    const isMicMutedRef = useRef(isMicMuted);
    useEffect(() => {
        isMicMutedRef.current = isMicMuted;
    }, [isMicMuted]);

    const peerConnections = useRef({});
    const localMediaStream = useRef(null);
    const peerMediaElements = useRef({[LOCAL_VIDEO]: null});
    const pendingPeers = useRef([]);
    const {user} = useUser();

    useEffect(() => {
        if (user) {
            setClientNames({ [LOCAL_VIDEO]: user.fullName ?? user.username });
        }
    }, [user]);

    const addNewClient = useCallback((newClient, cb) => {
        updateClients(prev => {
            if (prev.includes(newClient)) return prev;
            return [...prev, newClient];
        }, cb);
    }, [updateClients]);

    const provideMediaRef = useCallback((id, node) => {
        if (node) {
            peerMediaElements.current[id] = node;
            if (id === LOCAL_VIDEO && localMediaStream.current) {
                node.volume = 0;
                node.srcObject = localMediaStream.current;
            }
        } else {
            delete peerMediaElements.current[id];
        }
    }, []);

    const createPeerConnection = useCallback(async (peerID, createOffer) => {
        if (peerID in peerConnections.current) {
            console.warn(`Already connected to peer ${peerID}`);
            return;
        }

        console.log(`Creating peer connection for ${peerID}, createOffer: ${createOffer}`);

        const pc = new RTCPeerConnection({iceServers: freeice()});
        peerConnections.current[peerID] = pc;

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit(ACTIONS.RELAY_ICE, {
                    peerID,
                    user: {
                        id: user.id,
                        name: user.fullName ?? user.username,
                    },

                    iceCandidate: event.candidate,
                });
            }
        };

        pc.ontrack = ({streams: [remoteStream]}) => {
            console.log(`Received remote stream from ${peerID}`);
            addNewClient(peerID, () => {
                const el = peerMediaElements.current[peerID];
                if (el) {
                    el.srcObject = remoteStream;
                } else {
                    const interval = setInterval(() => {
                        const laterEl = peerMediaElements.current[peerID];
                        if (laterEl) {
                            laterEl.srcObject = remoteStream;
                            clearInterval(interval);
                        }
                    }, 200);
                }
            });
        };

        if (localMediaStream.current) {
            try {
                const muted = isMicMutedRef.current;
                localMediaStream.current.getTracks().forEach(track => {
                    if (track.kind === "audio") {
                        track.enabled = !muted;
                    }
                    pc.addTrack(track, localMediaStream.current);
                });
            } catch (e) {
                console.warn('Failed to add local tracks to pc', e);
            }
        }

        if (createOffer) {
            try {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                socket.emit(ACTIONS.RELAY_SDP, {
                    peerID,
                    sessionDescription: offer,
                });
            } catch (e) {
                console.error('Error creating offer', e);
            }
        }
    }, [addNewClient]);

    useEffect(() => {
        const handleNewPeer = async ({peerID, createOffer,user}) => {
            console.log(`ADD_PEER event: peerID=${peerID}, createOffer=${createOffer}, name=${user}`);

            if (!localMediaStream.current) {
                pendingPeers.current.push({peerID, createOffer,user});
                return;
            }
            setClientNames(prev => ({ ...prev, [peerID]: user.name }));


            await createPeerConnection(peerID, createOffer);
        };

        const handleSessionDescription = async ({peerID, sessionDescription}) => {
            const pc = peerConnections.current[peerID];

            try {
                await pc.setRemoteDescription(new RTCSessionDescription(sessionDescription));
                if (sessionDescription.type === 'offer') {
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    socket.emit(ACTIONS.RELAY_SDP, {
                        peerID,
                        user: {
                            id: user.id,
                            name: user.fullName ?? user.username,
                        },
                        sessionDescription: answer,
                    });
                }
            } catch (e) {
                console.log(e)
            }
        };

        const handleIceCandidate = ({peerID, iceCandidate}) => {
            console.log(`ICE_CANDIDATE from ${peerID}`);
            const pc = peerConnections.current[peerID];
            if (!pc) {
                return;
            }
            try {
                pc.addIceCandidate(new RTCIceCandidate(iceCandidate));
            } catch (e) {
                console.log(e)
            }
        };

        const handleRemovePeer = ({peerID}) => {
            console.log(`REMOVE_PEER: ${peerID}`);
            if (!peerID) return;
            if (peerConnections.current[peerID]) {
                try {
                    peerConnections.current[peerID].close();
                } catch (e) {
                    console.log(e)
                }
            }
            delete peerConnections.current[peerID];
            delete peerMediaElements.current[peerID];
            updateClients(prev => prev.filter(c => c !== peerID));
        };

        socket.on(ACTIONS.ADD_PEER, handleNewPeer);
        socket.on(ACTIONS.SESSION_DESCRIPTION, handleSessionDescription);
        socket.on(ACTIONS.ICE_CANDIDATE, handleIceCandidate);
        socket.on(ACTIONS.REMOVE_PEER, handleRemovePeer);

        return () => {
            socket.off(ACTIONS.ADD_PEER, handleNewPeer);
            socket.off(ACTIONS.SESSION_DESCRIPTION, handleSessionDescription);
            socket.off(ACTIONS.ICE_CANDIDATE, handleIceCandidate);
            socket.off(ACTIONS.REMOVE_PEER, handleRemovePeer);
        };
    }, [createPeerConnection, updateClients]);


    useEffect(() => {

        const start = async () => {
            try {
                let mediaConstraints = {
                    audio: true,
                    video: {
                        width: {ideal: 1280},
                        height: {ideal: 720},
                        frameRate: {ideal: 30, max: 30}
                    }
                };

                try {
                    localMediaStream.current = await navigator.mediaDevices.getUserMedia(mediaConstraints);
                } catch (videoError) {
                    console.warn('Failed to get high quality video, ...', videoError);
                    mediaConstraints = {
                        audio: true,
                        video: {
                            width: {ideal: 640},
                            height: {ideal: 480}
                        }
                    };
                    try {
                        localMediaStream.current = await navigator.mediaDevices.getUserMedia(mediaConstraints);
                    } catch (fallbackError) {
                        console.warn('Failed fallback video, trying audio only...', fallbackError);
                        localMediaStream.current = await navigator.mediaDevices.getUserMedia({audio: true});
                    }
                }

                const audioTrack = localMediaStream.current.getAudioTracks()[0];
                if (audioTrack) {
                    console.log('Audio track initial state:', audioTrack.enabled);
                    setIsMicMuted(!audioTrack.enabled);
                    isMicMutedRef.current = !audioTrack.enabled;
                }

                addNewClient(LOCAL_VIDEO, () => {
                    const el = peerMediaElements.current[LOCAL_VIDEO];
                    if (el) {
                        el.volume = 0;
                        el.srcObject = localMediaStream.current;
                    }
                });

                if (pendingPeers.current.length) {
                    console.log(`Processing ${pendingPeers.current.length} pending peers`);
                    const pending = [...pendingPeers.current];
                    pendingPeers.current = [];

                    for (const p of pending) {
                        await createPeerConnection(p.peerID, p.createOffer);
                    }
                }

                console.log(`Joining room: ${roomID}`);
                socket.emit(ACTIONS.JOIN, {

                    room: roomID,
                    user: {
                        id: user.id,
                        name: user.fullName ?? user.username,
                    }

                });
            } catch (e) {
                console.error('Error getting userMedia:', e);
                if (e.name === 'NotReadableError') {
                    alert('Камера или микрофон уже используются другим приложением.');
                } else if (e.name === 'NotAllowedError') {
                    alert('Доступ к камере/микрофону запрещен.');
                } else {
                    alert(`Ошибка доступа к медиа устройствам: ${e.message}`);
                }
            }
        };

        start();

        return () => {
            try {
                socket.emit(ACTIONS.LEAVE, {room: roomID});
            } catch (e) {
                console.log(e)
            }

            if (localMediaStream.current) {
                localMediaStream.current.getTracks().forEach(t => {
                    try {
                        t.stop();
                    } catch (e) {
                        console.log(e)
                    }
                });
                localMediaStream.current = null;
            }

            Object.values(peerConnections.current).forEach(pc => {
                try {
                    pc.close();
                } catch (e) {
                    console.log(e)
                }
            });
            peerConnections.current = {};

            peerMediaElements.current = {[LOCAL_VIDEO]: null};

            updateClients(prev => prev.filter(c => c !== LOCAL_VIDEO));
        };
    }, [roomID, addNewClient, updateClients, createPeerConnection]);

    useEffect(() => {
        const syncMicState = () => {
            if (localMediaStream.current) {
                const audioTrack = localMediaStream.current.getAudioTracks()[0];
                if (audioTrack) {
                    const currentMuted = !audioTrack.enabled;
                    if (currentMuted !== isMicMutedRef.current) {

                        isMicMutedRef.current = currentMuted;
                        setIsMicMuted(currentMuted);
                    }
                }
            }
        };

        const interval = setInterval(syncMicState, 500);
        return () => clearInterval(interval);
    }, []);

    const toggleMic = useCallback(() => {
        if (!localMediaStream.current) {
            console.log('toggleMic: no local media stream');
            return;
        }

        const audioTrack = localMediaStream.current.getAudioTracks()[0];
        if (audioTrack) {
            console.log('BEFORE toggle: audioTrack.enabled =', audioTrack.enabled);

            audioTrack.enabled = !audioTrack.enabled;
            const newMutedState = !audioTrack.enabled;

            isMicMutedRef.current = newMutedState;
            setIsMicMuted(newMutedState);

            try {
                Object.values(peerConnections.current).forEach(pc => {
                    pc.getSenders().forEach(sender => {
                        if (sender.track && sender.track.kind === 'audio') {
                            sender.replaceTrack(audioTrack).catch(e => console.warn('replaceTrack failed', e));
                        }
                    });
                });
            } catch (e) {
                console.warn('Error while replacing tracks on senders', e);
            }

            try {
                if (ACTIONS.MUTE_STATE) {
                    socket.emit(ACTIONS.MUTE_STATE, {room: roomID, muted: newMutedState});
                } else {
                    socket.emit('MUTE_STATE', {room: roomID, muted: newMutedState});
                }
            } catch (e) {
                console.warn('Failed to emit mute state', e);
            }

            console.log(`Mic is now ${audioTrack.enabled ? 'ENABLED ' : 'DISABLED'}`);
        } else {
            console.log('toggleMic: no audio track found');
        }
    }, [roomID]);

    const getMicStatus = useCallback(() => {
        if (!localMediaStream.current) return true;
        const audioTrack = localMediaStream.current.getAudioTracks()[0];
        if (!audioTrack) return true;
        console.log('getMicStatus: audioTrack.enabled =', audioTrack.enabled);
        return !audioTrack.enabled;
    }, []);

    return {clients, provideMediaRef, toggleMic, isMicMuted, getMicStatus, clientNames };
}
