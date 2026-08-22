import "./course.css";
import React, { useEffect, useRef, useState, useCallback } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { toast } from 'react-toastify';
import Pagination from "../../components/Pagination";
import { Users, Video, VideoOff, Mic, MicOff, MessageCircle, Monitor, X, GripHorizontal } from 'lucide-react';

// Child component for rendering individual student tile cleanly via React refs
const StudentVideoTile = ({ participant, studentName, onClearHand }) => {
  const videoContainerRef = useRef(null);

  useEffect(() => {
    if (participant.hasVideo && participant.videoTrack && videoContainerRef.current) {
      try {
        participant.videoTrack.play(videoContainerRef.current, { fit: 'contain' });
      } catch (e) {
        console.error("Error playing student video track:", e);
      }
    }
  }, [participant.hasVideo, participant.videoTrack]);

  const displayName = studentName || participant.name || 'Student';

  return (
    <div className="relative w-full h-full bg-gray-800 rounded-xl overflow-hidden border border-white/10 shadow-lg group flex items-center justify-center">
      {participant.hasVideo && participant.videoTrack ? (
        <div ref={videoContainerRef} className="w-full h-full object-contain" />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 p-4 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold mb-2 shadow-lg">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <p className="text-white text-sm font-semibold truncate max-w-[150px]">{displayName}</p>
          <p className="text-white/40 text-xs mt-1">Camera Off</p>
        </div>
      )}

      {/* Name and mic status badge at top-left */}
      <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 z-10 border border-white/10">
        {participant.hasAudio ? (
          <Mic className="w-3.5 h-3.5 text-green-400" />
        ) : (
          <MicOff className="w-3.5 h-3.5 text-red-400" />
        )}
        <span className="font-semibold truncate max-w-[120px]">{displayName}</span>
      </div>

      {/* Hand raise indicator at top-right */}
      {participant.isHandRaised && (
        <button
          onClick={() => onClearHand(participant.uid)}
          className="absolute top-2 right-2 bg-yellow-500 hover:bg-yellow-600 text-white p-1.5 rounded-full animate-bounce shadow-lg z-10 text-base cursor-pointer"
          title="Student raised hand! Click to dismiss"
        >
          ✋
        </button>
      )}
    </div>
  );
};

const LiveVideo = ({ session, onClose }) => {
  const localVideoRef = useRef(null);
  const clientRef = useRef(null);
  const tracksRef = useRef([]);
  const screenTrackRef = useRef(null);
  const dataStreamIdRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [remoteParticipants, setRemoteParticipants] = useState([]);
  const [studentNames, setStudentNames] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);

  // Draggable PIP Window State
  const [pipPos, setPipPos] = useState({ 
    x: typeof window !== 'undefined' ? Math.max(10, window.innerWidth - 310) : 20, 
    y: 80 
  });
  const [isDraggingPip, setIsDraggingPip] = useState(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // 16 students per page to support up to 4x4 grid view
  const STUDENTS_PER_PAGE = 16;

  const formatSenderName = (sender) => {
    if (!sender) return 'Student';
    if (sender === 'You' || sender === 'Teacher' || sender.startsWith('You (')) return sender;
    const match = sender.match(/^([a-zA-Z\s]+)\d{10,}$/);
    if (match && match[1]) {
      const rawName = match[1];
      return rawName.charAt(0).toUpperCase() + rawName.slice(1);
    }
    return sender;
  };

  const getGridStyle = (count) => {
    if (count <= 1) return { gridTemplateColumns: '1fr', gridTemplateRows: '1fr' };
    if (count === 2) return { gridTemplateColumns: 'repeat(2, 1fr)', gridTemplateRows: '1fr' };
    if (count <= 4) return { gridTemplateColumns: 'repeat(2, 1fr)', gridTemplateRows: 'repeat(2, 1fr)' };
    if (count <= 9) return { gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(3, 1fr)' };
    return { gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'repeat(4, 1fr)' };
  };

  const remoteUsersCount = remoteParticipants.length;
  const totalPages = Math.max(1, Math.ceil(remoteUsersCount / STUDENTS_PER_PAGE));
  const startIndex = (currentPage - 1) * STUDENTS_PER_PAGE;
  const endIndex = startIndex + STUDENTS_PER_PAGE;
  const currentPageParticipants = remoteParticipants.slice(startIndex, endIndex);
  const gridStyle = getGridStyle(currentPageParticipants.length);

  // Handle Dragging PIP Window
  const handlePipMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsDraggingPip(true);
    dragOffsetRef.current = {
      x: e.clientX - pipPos.x,
      y: e.clientY - pipPos.y,
    };
  };

  const handlePipTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    setIsDraggingPip(true);
    dragOffsetRef.current = {
      x: e.touches[0].clientX - pipPos.x,
      y: e.touches[0].clientY - pipPos.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingPip) return;
      let newX = e.clientX - dragOffsetRef.current.x;
      let newY = e.clientY - dragOffsetRef.current.y;

      const maxX = Math.max(10, window.innerWidth - 300);
      const maxY = Math.max(10, window.innerHeight - 240);

      newX = Math.max(10, Math.min(newX, maxX));
      newY = Math.max(10, Math.min(newY, maxY));

      setPipPos({ x: newX, y: newY });
    };

    const handleTouchMove = (e) => {
      if (!isDraggingPip || e.touches.length !== 1) return;
      let newX = e.touches[0].clientX - dragOffsetRef.current.x;
      let newY = e.touches[0].clientY - dragOffsetRef.current.y;

      const maxX = Math.max(10, window.innerWidth - 300);
      const maxY = Math.max(10, window.innerHeight - 240);

      newX = Math.max(10, Math.min(newX, maxX));
      newY = Math.max(10, Math.min(newY, maxY));

      setPipPos({ x: newX, y: newY });
    };

    const handleDragEnd = () => {
      if (isDraggingPip) setIsDraggingPip(false);
    };

    if (isDraggingPip) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleDragEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDraggingPip]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [remoteUsersCount, totalPages, currentPage]);

  const clearHandRaise = useCallback((uid) => {
    setRemoteParticipants(prev =>
      prev.map(p => (String(p.uid) === String(uid) ? { ...p, isHandRaised: false } : p))
    );
  }, []);

  const sendStreamMsg = useCallback(async (dataObj) => {
    if (!clientRef.current || clientRef.current.connectionState !== 'CONNECTED') return;
    try {
      const jsonStr = JSON.stringify(dataObj);
      const encoded = new TextEncoder().encode(jsonStr);
      if (dataStreamIdRef.current !== null) {
        await clientRef.current.sendStreamMessage(dataStreamIdRef.current, encoded);
      } else {
        await clientRef.current.sendStreamMessage(encoded);
      }
    } catch (err) {
      try {
        const encoded = new TextEncoder().encode(JSON.stringify(dataObj));
        await clientRef.current.sendStreamMessage(encoded);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (!session) return;
    let mounted = true;

    const initAgora = async () => {
      try {
        setIsLoading(true);

        const client = AgoraRTC.createClient({
          mode: 'rtc',
          codec: 'vp8',
        });

        clientRef.current = client;

        const userJoinedHandler = (remoteUser) => {
          if (!mounted) return;
          const uidStr = String(remoteUser.uid);
          toast.info('A student joined the session');

          setRemoteParticipants(prev => {
            const exists = prev.some(p => String(p.uid) === uidStr);
            if (exists) return prev;
            return [
              ...prev,
              {
                uid: remoteUser.uid,
                name: studentNames[uidStr] || 'Student',
                hasVideo: false,
                hasAudio: false,
                videoTrack: null,
                audioTrack: null,
                isHandRaised: false,
              },
            ];
          });
        };

        const userPublishedHandler = async (remoteUser, mediaType) => {
          if (!mounted) return;
          try {
            await client.subscribe(remoteUser, mediaType);
            if (!mounted) return;

            const uidStr = String(remoteUser.uid);

            setRemoteParticipants(prev => {
              const exists = prev.some(p => String(p.uid) === uidStr);
              if (exists) {
                return prev.map(p => {
                  if (String(p.uid) === uidStr) {
                    return {
                      ...p,
                      hasVideo: mediaType === 'video' ? true : p.hasVideo,
                      hasAudio: mediaType === 'audio' ? true : p.hasAudio,
                      videoTrack: mediaType === 'video' ? remoteUser.videoTrack : p.videoTrack,
                      audioTrack: mediaType === 'audio' ? remoteUser.audioTrack : p.audioTrack,
                    };
                  }
                  return p;
                });
              } else {
                return [
                  ...prev,
                  {
                    uid: remoteUser.uid,
                    name: studentNames[uidStr] || 'Student',
                    hasVideo: mediaType === 'video',
                    hasAudio: mediaType === 'audio',
                    videoTrack: mediaType === 'video' ? remoteUser.videoTrack : null,
                    audioTrack: mediaType === 'audio' ? remoteUser.audioTrack : null,
                    isHandRaised: false,
                  },
                ];
              }
            });

            if (mediaType === 'audio' && mounted && remoteUser.audioTrack) {
              remoteUser.audioTrack.play();
            }
          } catch (error) {
            console.error("Subscribe error:", error);
          }
        };

        const userUnpublishedHandler = (remoteUser, mediaType) => {
          if (!mounted) return;
          const uidStr = String(remoteUser.uid);

          setRemoteParticipants(prev =>
            prev.map(p => {
              if (String(p.uid) === uidStr) {
                if (mediaType === 'video') {
                  return { ...p, hasVideo: false, videoTrack: null };
                }
                if (mediaType === 'audio') {
                  if (p.audioTrack) p.audioTrack.stop();
                  return { ...p, hasAudio: false, audioTrack: null };
                }
              }
              return p;
            })
          );
        };

        const userLeftHandler = (remoteUser) => {
          if (!mounted) return;
          const uidStr = String(remoteUser.uid);
          toast.info('A student left the session');

          setRemoteParticipants(prev => prev.filter(p => String(p.uid) !== uidStr));
        };

        const streamMessageHandler = (remoteUser, message) => {
          if (!mounted) return;
          try {
            const uidStr = String(remoteUser.uid);
            const text = new TextDecoder().decode(message);
            const msgData = JSON.parse(text);

            if (msgData.type === 'student_info' && msgData.name) {
              setStudentNames(prev => ({
                ...prev,
                [uidStr]: msgData.name,
              }));
              setRemoteParticipants(prev =>
                prev.map(p => (String(p.uid) === uidStr ? { ...p, name: msgData.name } : p))
              );
              return;
            }

            if (msgData.type === 'hand_raise') {
              const displayName = formatSenderName(msgData.studentName || msgData.name || 'A student');
              if (msgData.isRaised) {
                toast.info(`${displayName} raised a hand!`);
              }
              setRemoteParticipants(prev =>
                prev.map(p => (String(p.uid) === uidStr ? { ...p, isHandRaised: Boolean(msgData.isRaised) } : p))
              );
              return;
            }

            if (msgData.type === 'chat' || msgData.text) {
              setMessages(prev => [
                ...prev,
                {
                  sender: formatSenderName(msgData.sender || msgData.name || 'Student'),
                  text: msgData.text,
                  isLocal: false,
                },
              ]);
            }
          } catch (error) {
            try {
              const text = new TextDecoder().decode(message);
              setMessages(prev => [
                ...prev,
                {
                  sender: 'Student',
                  text: text,
                  isLocal: false,
                },
              ]);
            } catch (e) {}
          }
        };

        client.on('user-joined', userJoinedHandler);
        client.on('user-published', userPublishedHandler);
        client.on('user-unpublished', userUnpublishedHandler);
        client.on('user-left', userLeftHandler);
        client.on('stream-message', streamMessageHandler);

        if (!mounted) return;
        await client.join(
          session.appId,
          session.channelName,
          session.token,
          session.uid
        );

        try {
          dataStreamIdRef.current = await client.createDataStream({ syncWithAudio: false, ordered: true });
        } catch (e) {
          dataStreamIdRef.current = null;
        }

        if (!mounted) return;

        // Initialize any users already in channel
        const existingUsers = client.remoteUsers || [];
        const initialParticipants = [];

        for (const remoteUser of existingUsers) {
          if (!mounted) return;
          try {
            if (remoteUser.hasVideo) await client.subscribe(remoteUser, 'video');
            if (remoteUser.hasAudio) await client.subscribe(remoteUser, 'audio');
            if (remoteUser.hasAudio && remoteUser.audioTrack) {
              remoteUser.audioTrack.play();
            }

            initialParticipants.push({
              uid: remoteUser.uid,
              name: studentNames[String(remoteUser.uid)] || 'Student',
              hasVideo: Boolean(remoteUser.hasVideo && remoteUser.videoTrack),
              hasAudio: Boolean(remoteUser.hasAudio && remoteUser.audioTrack),
              videoTrack: remoteUser.videoTrack || null,
              audioTrack: remoteUser.audioTrack || null,
              isHandRaised: false,
            });
          } catch (subErr) {}
        }

        if (mounted) {
          setRemoteParticipants(initialParticipants);
        }

        // Create local camera and mic tracks for teacher
        try {
          if (!mounted) return;
          const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();

          tracksRef.current = [audioTrack, videoTrack];

          setTimeout(() => {
            if (mounted && localVideoRef.current && videoTrack) {
              videoTrack.play(localVideoRef.current, { fit: 'cover' });
            }
          }, 100);

          if (!mounted) return;
          await client.publish([audioTrack, videoTrack]);
        } catch (mediaError) {
          console.warn("Teacher media tracks error:", mediaError);
        }

        if (mounted) {
          setIsLoading(false);
          toast.success('Live streaming started!');
        }
      } catch (error) {
        if (mounted) {
          toast.error('Failed to start live streaming');
          setIsLoading(false);
        }
      }
    };

    const handleBeforeUnload = () => {
      tracksRef.current.forEach((track) => {
        if (track) {
          try {
            track.stop();
            track.close();
          } catch (e) {}
        }
      });
      if (clientRef.current) {
        clientRef.current.leave().catch(() => {});
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    initAgora();

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      mounted = false;

      tracksRef.current.forEach((track) => {
        if (track) {
          try {
            track.stop();
            track.close();
          } catch (e) {}
        }
      });
      tracksRef.current = [];

      if (screenTrackRef.current) {
        try {
          screenTrackRef.current.stop();
          screenTrackRef.current.close();
        } catch (e) {}
        screenTrackRef.current = null;
      }

      if (clientRef.current) {
        clientRef.current.removeAllListeners();
        clientRef.current.leave().catch(() => {});
      }

      setRemoteParticipants([]);
      setCurrentPage(1);
    };
  }, [session]);

  const handleEndStream = async () => {
    try {
      tracksRef.current.forEach((track) => {
        if (track) {
          try {
            track.stop();
            track.close();
          } catch (e) {}
        }
      });
      tracksRef.current = [];

      if (screenTrackRef.current) {
        try {
          screenTrackRef.current.stop();
          screenTrackRef.current.close();
        } catch (e) {}
        screenTrackRef.current = null;
      }

      if (clientRef.current) {
        await clientRef.current.leave();
        clientRef.current.removeAllListeners();
      }

      toast.success('Live streaming ended');
      onClose();
    } catch (error) {
      toast.error('Failed to end stream');
      onClose();
    }
  };

  const toggleCamera = async () => {
    const nextState = !isCameraOn;
    setIsCameraOn(nextState);
    const videoTrack = tracksRef.current.find(
      (track) => track && track.trackMediaType === 'video'
    );
    if (videoTrack) {
      try {
        await videoTrack.setEnabled(nextState);
      } catch (e) {
        console.error("Error toggling camera track:", e);
      }
    }
  };

  const toggleMic = async () => {
    const nextState = !isMicOn;
    setIsMicOn(nextState);
    const audioTrack = tracksRef.current.find(
      (track) => track && track.trackMediaType === 'audio'
    );
    if (audioTrack) {
      try {
        await audioTrack.setEnabled(nextState);
      } catch (e) {
        console.error("Error toggling audio track:", e);
      }
    }
  };

  const sendMessage = async () => {
    if (input.trim() && clientRef.current) {
      const messageText = input.trim();
      
      sendStreamMsg({
        type: 'chat',
        sender: 'Teacher',
        text: messageText,
        timestamp: Date.now()
      });
      
      setMessages(prev => [...prev, { 
        sender: 'You (Teacher)', 
        text: messageText,
        isLocal: true
      }]);
      
      setInput('');
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        if (screenTrackRef.current) {
          try {
            await clientRef.current.unpublish(screenTrackRef.current);
            screenTrackRef.current.stop();
            screenTrackRef.current.close();
          } catch (e) {}
          screenTrackRef.current = null;
        }
        
        const camVideoTrack = tracksRef.current.find(
          (track) => track && track.trackMediaType === 'video'
        );
        if (camVideoTrack && isCameraOn && clientRef.current) {
          try {
            await clientRef.current.publish(camVideoTrack);
          } catch (pubErr) {}
        }
        
        setIsScreenSharing(false);
        toast.success('Screen sharing stopped');
      } else {
        const screenTrack = await AgoraRTC.createScreenVideoTrack({
          encoderConfig: '1080p_1',
        }, 'disable');

        const camVideoTrack = tracksRef.current.find(
          (track) => track && track.trackMediaType === 'video'
        );
        if (camVideoTrack && clientRef.current) {
          try {
            await clientRef.current.unpublish(camVideoTrack);
          } catch (e) {}
        }

        screenTrackRef.current = screenTrack;

        screenTrack.on('track-ended', async () => {
          try {
            if (screenTrackRef.current) {
              await clientRef.current.unpublish(screenTrackRef.current);
              screenTrackRef.current.stop();
              screenTrackRef.current.close();
              screenTrackRef.current = null;
            }
            
            const currentCamTrack = tracksRef.current.find(
              (track) => track && track.trackMediaType === 'video'
            );
            if (currentCamTrack && isCameraOn && clientRef.current) {
              await clientRef.current.publish(currentCamTrack);
            }
            
            setIsScreenSharing(false);
            toast.info('Screen sharing ended');
          } catch (err) {}
        });

        if (clientRef.current) {
          await clientRef.current.publish(screenTrack);
        }
        setIsScreenSharing(true);
        toast.success('Screen sharing started');
      }
    } catch (error) {
      console.warn("Screen share toggle error:", error);
      setIsScreenSharing(false);

      const isUserCancel = error?.code === 'PERMISSION_DENIED' || 
                           error?.message?.includes('User canceled') || 
                           error?.message?.includes('Permission denied') ||
                           error?.name === 'NotAllowedError';

      if (isUserCancel) {
        toast.info('Screen sharing was cancelled');
      } else if (error?.message?.includes('CAN_NOT_PUBLISH_MULTIPLE_VIDEO_TRACKS')) {
        toast.error('Please stop camera first before sharing screen');
      } else {
        toast.error('Failed to start screen share');
      }

      const camVideoTrack = tracksRef.current.find(
        (track) => track && track.trackMediaType === 'video'
      );
      if (camVideoTrack && isCameraOn && clientRef.current) {
        try {
          await clientRef.current.publish(camVideoTrack);
        } catch (e) {}
      }
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center z-50">
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl text-center border border-white/20">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-xl font-semibold">Starting live stream...</p>
          <p className="text-white/60 text-sm mt-2">Please wait while we connect you</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 z-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
            <Video className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{session.title}</h2>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-400 flex items-center gap-1 font-medium">
                <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></span>
                Live
              </span>
              <span className="text-white/50">|</span>
              <span className="text-white/70 flex items-center gap-1 font-medium">
                <Users className="w-4 h-4" />
                {remoteUsersCount} Student{remoteUsersCount !== 1 ? 's' : ''} Connected
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={handleEndStream}
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-6 py-2.5 rounded-lg text-white font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg shadow-red-500/30 cursor-pointer"
        >
          <X className="w-5 h-5" />
          End Stream
        </button>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative flex p-4 gap-4 overflow-hidden">
        {/* Student Grid / Waiting State */}
        <div className="flex-1 bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 shadow-2xl p-4 flex items-center justify-center">
          {remoteUsersCount === 0 ? (
            <div className="text-center p-8 flex flex-col items-center justify-center h-full">
              <div className="relative inline-block mb-6">
                <div className="w-32 h-32 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/50">
                  <Video className="w-16 h-16 text-white" />
                </div>
                <div className="absolute bottom-0 right-0 w-10 h-10 bg-green-500 rounded-full border-4 border-gray-900 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">You</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Waiting for Students</h3>
              <p className="text-white/60 text-lg">Students will appear here in real time as they join the class</p>
              <div className="mt-6 flex justify-center gap-2">
                <span className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></span>
                <span className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                <span className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              </div>
            </div>
          ) : (
            <div 
              className={`w-full h-full ${
                currentPageParticipants.length === 1 
                  ? 'flex items-center justify-center' 
                  : 'grid gap-4'
              }`}
              style={currentPageParticipants.length === 1 ? {} : gridStyle}
            >
              {currentPageParticipants.length === 1 ? (
                <div className="w-full max-w-4xl h-full max-h-[80vh]">
                  <StudentVideoTile
                    participant={currentPageParticipants[0]}
                    studentName={studentNames[String(currentPageParticipants[0].uid)] || currentPageParticipants[0].name}
                    onClearHand={clearHandRaise}
                  />
                </div>
              ) : (
                currentPageParticipants.map((participant) => (
                  <StudentVideoTile
                    key={participant.uid}
                    participant={participant}
                    studentName={studentNames[String(participant.uid)] || participant.name}
                    onClearHand={clearHandRaise}
                  />
                ))
              )}
            </div>
          )}
        </div>

        {/* Local Video (Teacher Preview) - DRAGGABLE WINDOW */}
        <div 
          style={{ 
            position: 'fixed',
            left: `${pipPos.x}px`,
            top: `${pipPos.y}px`,
            touchAction: 'none'
          }}
          className={`w-72 h-52 bg-gray-800 rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 z-30 transition-shadow ${
            isDraggingPip ? 'shadow-purple-500/50 ring-2 ring-purple-400' : 'hover:border-purple-400/60'
          }`}
        >
          {/* Drag Handle Header */}
          <div 
            onMouseDown={handlePipMouseDown}
            onTouchStart={handlePipTouchStart}
            className="absolute top-0 left-0 right-0 h-7 bg-black/70 backdrop-blur-md z-20 flex items-center justify-between px-2 cursor-grab active:cursor-grabbing select-none border-b border-white/10"
            title="Click and drag to move preview window anywhere"
          >
            <div className="flex items-center gap-1.5 text-white/80 text-xs font-semibold">
              <GripHorizontal className="w-4 h-4 text-purple-400" />
              <span>Drag Preview</span>
            </div>
            <span className="text-[10px] bg-purple-500/30 text-purple-300 px-1.5 py-0.5 rounded font-mono">You</span>
          </div>

          <div className="w-full h-full pt-7 relative">
            {isCameraOn ? (
              <div ref={localVideoRef} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-gray-700 to-gray-800 flex items-center justify-center">
                <div className="text-center">
                  <VideoOff className="w-10 h-10 text-white/50 mx-auto mb-1" />
                  <p className="text-white/50 text-xs">Camera Off</p>
                </div>
              </div>
            )}
            <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 z-10 border border-white/10">
              {isMicOn ? <Mic className="w-3.5 h-3.5 text-green-400" /> : <MicOff className="w-3.5 h-3.5 text-red-400" />}
              <span>You (Teacher)</span>
            </div>
            {!isCameraOn && (
              <div className="absolute top-9 right-2 bg-red-500 p-1.5 rounded-full z-10">
                <VideoOff className="w-3.5 h-3.5 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Chat Panel */}
        {showChat && (
          <div className="absolute bottom-24 right-8 w-96 h-96 bg-gray-800/95 backdrop-blur-md rounded-2xl flex flex-col border border-white/10 shadow-2xl z-20">
            <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-2xl flex justify-between items-center">
              <span className="font-semibold flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Live Chat
              </span>
              <button 
                onClick={() => setShowChat(false)} 
                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-white/50 py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No messages yet</p>
                  <p className="text-sm">Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div key={index} className="bg-white/10 rounded-lg p-3">
                    <span className="text-purple-400 font-semibold text-sm">{formatSenderName(msg.sender)}: </span>
                    <span className="text-white">{msg.text}</span>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
                  placeholder="Type a message..."
                />
                <button 
                  onClick={sendMessage} 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-5 py-3 rounded-xl text-white font-semibold transition-all cursor-pointer"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 bg-black/30 backdrop-blur-md border-t border-white/10">
          <div className="flex justify-between items-center">
            <div className="text-white/70 text-sm">
              Showing {startIndex + 1}-{Math.min(endIndex, remoteUsersCount)} of {remoteUsersCount} students
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="px-6 py-5 bg-black/40 backdrop-blur-md border-t border-white/10 flex justify-center items-center gap-4">
        <button
          onClick={toggleCamera}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
            isCameraOn 
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600' 
              : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
          } text-white shadow-lg cursor-pointer`}
        >
          {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          {isCameraOn ? 'Camera' : 'Camera Off'}
        </button>

        <button
          onClick={toggleMic}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
            isMicOn 
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600' 
              : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
          } text-white shadow-lg cursor-pointer`}
        >
          {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          {isMicOn ? 'Mic' : 'Mic Off'}
        </button>

        <button
          onClick={() => setShowChat(!showChat)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-6 py-3 rounded-xl text-white font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg cursor-pointer"
        >
          <MessageCircle className="w-5 h-5" />
          Chat
          {messages.length > 0 && (
            <span className="bg-white text-purple-600 text-xs font-bold px-2 py-0.5 rounded-full">
              {messages.length}
            </span>
          )}
        </button>

        <button
          onClick={toggleScreenShare}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg cursor-pointer ${
            isScreenSharing 
              ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' 
              : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600'
          } text-white`}
        >
          <Monitor className="w-5 h-5" />
          {isScreenSharing ? 'Stop Share' : 'Share Screen'}
        </button>
      </div>
    </div>
  );
};

export default LiveVideo;