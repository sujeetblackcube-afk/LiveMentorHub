import React, { useEffect, useRef, useState, useCallback } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { toast } from 'react-toastify';
import { Users, Video, VideoOff, Mic, MicOff, MessageCircle, Hand, X, GripHorizontal } from 'lucide-react';
import axios from 'axios';
import { useAuth } from "@/store/useAuth";
import { API_BASE, LIVESESSION_PATHS } from "@/lib/api";

const StudentLiveVideo = ({ 
  sessionId, 
  studentId, 
  studentName,
  onClose 
}) => {
  const { user } = useAuth();

  const getEffectiveStudentName = () => {
    if (studentName && studentName.trim()) return studentName.trim();
    if (user?.name && user.name.trim()) return user.name.trim();
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("userName") || localStorage.getItem("studentName");
      if (storedName && storedName.trim()) return storedName.trim();
      try {
        const authStorage = localStorage.getItem("auth-storage");
        if (authStorage) {
          const parsed = JSON.parse(authStorage);
          if (parsed?.state?.user?.name) return parsed.state.user.name;
        }
      } catch (e) {}
    }
    if (studentId) {
      const match = studentId.match(/^([a-zA-Z\s]+)\d{10,}$/);
      if (match && match[1]) {
        const rawName = match[1];
        return rawName.charAt(0).toUpperCase() + rawName.slice(1);
      }
      return studentId;
    }
    return 'Student';
  };

  const effectiveStudentName = getEffectiveStudentName();

  const localVideoRef = useRef(null);
  const teacherVideoRef = useRef(null);

  const clientRef = useRef(null);
  const tracksRef = useRef([]);
  const dataStreamIdRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [remoteUsersCount, setRemoteUsersCount] = useState(0);
  const [teacherUser, setTeacherUser] = useState(null);
  const [teacherHasVideo, setTeacherHasVideo] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [handRaised, setHandRaised] = useState(false);

  // Draggable PIP Window State for Student
  const [pipPos, setPipPos] = useState({ 
    x: typeof window !== 'undefined' ? Math.max(10, window.innerWidth - 310) : 20, 
    y: 80 
  });
  const [isDraggingPip, setIsDraggingPip] = useState(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

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

  const getDisplayName = (sender, isLocal) => {
    if (isLocal) return 'You';
    if (sender === 'Teacher' || sender.toLowerCase().includes('teacher')) return 'Teacher';
    const match = sender.match(/^([a-zA-Z\s]+)\d{10,}$/);
    if (match && match[1]) {
      const rawName = match[1];
      return rawName.charAt(0).toUpperCase() + rawName.slice(1);
    }
    return sender || 'Student';
  };

  // Helper to send stream message reliably
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

  // Fetch session backend details
  useEffect(() => {
    const joinSession = async () => {
      try {
        setIsLoading(true);
        const token = typeof window !== "undefined" ? localStorage.getItem("cp_token") : null;
        
        const headers = {
          "Content-Type": "application/json",
        };
        
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        
        const response = await axios.post(
          `${API_BASE}${LIVESESSION_PATHS.joinSession}`, 
          { sessionId, studentId },
          { headers }
        );

        if (response.data.success) {
          setSession(response.data);
          toast.success('Joined session successfully!');
        } else {
          toast.error(response.data.message || 'Failed to join session');
          onClose();
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error(error.response?.data?.message || 'Failed to join session');
        } else {
          toast.error('Failed to join session');
        }
        onClose();
      }
    };

    if (sessionId && studentId) {
      joinSession();
    }
  }, [sessionId, studentId, onClose]);

  // Handle playing teacher video track cleanly in teacherVideoRef
  useEffect(() => {
    if (teacherUser && teacherUser.videoTrack && teacherVideoRef.current) {
      try {
        teacherUser.videoTrack.play(teacherVideoRef.current, { fit: 'contain' });
      } catch (e) {
        console.error("Error playing teacher video track:", e);
      }
    }
  }, [teacherUser, teacherHasVideo]);

  // Main Agora Client setup
  useEffect(() => {
    if (!session) return;
    let mounted = true;
    let infoInterval = null;

    const initAgora = async () => {
      try {
        setIsLoading(true);

        const client = AgoraRTC.createClient({
          mode: 'rtc',
          codec: 'vp8',
        });

        clientRef.current = client;

        const teacherUidStr = session.teacherUid ? String(session.teacherUid) : null;

        const checkIsTeacher = (remoteUser) => {
          if (!remoteUser) return false;
          if (teacherUidStr && String(remoteUser.uid) === teacherUidStr) return true;
          if (session.teacherName && remoteUser.uid === session.teacherUid) return true;
          return false;
        };

        const updateParticipantState = () => {
          if (!mounted) return;
          const allRemote = client.remoteUsers || [];
          setRemoteUsersCount(allRemote.length);

          const teacher = allRemote.find(u => checkIsTeacher(u));
          if (teacher) {
            setTeacherUser(teacher);
            setTeacherHasVideo(Boolean(teacher.hasVideo && teacher.videoTrack));
          } else {
            setTeacherUser(null);
            setTeacherHasVideo(false);
          }
        };

        const userJoinedHandler = (remoteUser) => {
          if (!mounted) return;
          updateParticipantState();
        };

        const userPublishedHandler = async (remoteUser, mediaType) => {
          if (!mounted) return;
          try {
            await client.subscribe(remoteUser, mediaType);
            if (!mounted) return;

            updateParticipantState();

            if (mediaType === 'audio' && remoteUser.audioTrack) {
              remoteUser.audioTrack.play();
            }

            if (mediaType === 'video' && checkIsTeacher(remoteUser)) {
              setTimeout(() => {
                if (mounted && remoteUser.videoTrack && teacherVideoRef.current) {
                  remoteUser.videoTrack.play(teacherVideoRef.current, { fit: 'contain' });
                }
              }, 100);
            }
          } catch (error) {
            console.error("Subscribe error:", error);
          }
        };

        const userUnpublishedHandler = (remoteUser, mediaType) => {
          if (!mounted) return;
          updateParticipantState();
          if (mediaType === 'audio' && remoteUser.audioTrack) {
            remoteUser.audioTrack.stop();
          }
        };

        const userLeftHandler = (remoteUser) => {
          if (!mounted) return;
          updateParticipantState();
        };

        const streamMessageHandler = (remoteUser, message) => {
          if (!mounted) return;
          try {
            const text = new TextDecoder().decode(message);
            const msgData = JSON.parse(text);

            if (msgData.type === 'chat') {
              setMessages(prev => [...prev, { 
                sender: msgData.sender || 'Teacher', 
                text: msgData.text,
                isLocal: false,
                timestamp: msgData.timestamp || Date.now()
              }]);
            } else if (msgData.text && !msgData.type) {
              setMessages(prev => [...prev, { 
                sender: msgData.sender || (checkIsTeacher(remoteUser) ? 'Teacher' : 'Student'), 
                text: msgData.text,
                isLocal: false,
                timestamp: msgData.timestamp || Date.now()
              }]);
            }
          } catch (error) {
            try {
              const text = new TextDecoder().decode(message);
              setMessages(prev => [...prev, { 
                sender: checkIsTeacher(remoteUser) ? 'Teacher' : 'Student', 
                text: text,
                isLocal: false,
                timestamp: Date.now()
              }]);
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
        
        const existingUsers = client.remoteUsers || [];
        for (const remoteUser of existingUsers) {
          if (!mounted) return;
          try {
            if (remoteUser.hasVideo) await client.subscribe(remoteUser, 'video');
            if (remoteUser.hasAudio) await client.subscribe(remoteUser, 'audio');
            if (remoteUser.hasAudio && remoteUser.audioTrack) {
              remoteUser.audioTrack.play();
            }
          } catch (subErr) {}
        }
        updateParticipantState();

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
          console.warn("Student media tracks error (mic/camera optional):", mediaError);
        }

        const broadcastInfo = () => {
          sendStreamMsg({
            type: 'student_info',
            studentId: studentId,
            name: effectiveStudentName || user?.name || 'Student',
            timestamp: Date.now()
          });
        };

        broadcastInfo();
        infoInterval = setInterval(broadcastInfo, 5000);

        if (mounted) {
          setIsLoading(false);
          toast.success('Connected to live session!');
        }
      } catch (error) {
        if (mounted) {
          toast.error('Failed to connect to live session');
          setIsLoading(false);
        }
      }
    };

    initAgora();

    return () => {
      mounted = false;
      if (infoInterval) clearInterval(infoInterval);

      tracksRef.current.forEach((track) => {
        if (track) {
          try {
            track.stop();
            track.close();
          } catch (e) {}
        }
      });
      tracksRef.current = [];

      if (clientRef.current) {
        clientRef.current.removeAllListeners();
        clientRef.current.leave().catch(() => {});
      }

      setRemoteUsersCount(0);
      setTeacherUser(null);
      setTeacherHasVideo(false);
    };
  }, [session, studentId, effectiveStudentName, sendStreamMsg]);

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

  const raiseHand = () => {
    const nextHandState = !handRaised;
    setHandRaised(nextHandState);
    toast.info(nextHandState ? 'Hand raised!' : 'Hand lowered');
    
    sendStreamMsg({
      type: 'hand_raise',
      studentId: studentId,
      studentName: effectiveStudentName,
      name: effectiveStudentName || user?.name || 'Student',
      isRaised: nextHandState,
      timestamp: Date.now()
    });
  };

  const sendMessage = async () => {
    if (input.trim()) {
      const messageText = input.trim();
      
      sendStreamMsg({
        type: 'chat',
        sender: effectiveStudentName,
        studentId: studentId,
        name: effectiveStudentName || user?.name || 'Student',
        text: messageText,
        timestamp: Date.now()
      });

      setMessages(prev => [...prev, { 
        sender: 'You', 
        text: messageText,
        isLocal: true,
        timestamp: Date.now()
      }]);
      
      setInput('');
    }
  };

  const handleLeaveSession = async () => {
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

      if (clientRef.current) {
        await clientRef.current.leave();
        clientRef.current.removeAllListeners();
      }

      toast.success('Left session');
      onClose();
    } catch (error) {
      toast.error('Failed to leave session');
      onClose();
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center z-50">
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl text-center border border-white/20">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-xl font-semibold">Joining session...</p>
          <p className="text-white/60 text-sm mt-2">Please wait while we connect you</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 z-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 bg-black/35 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-lg">
            <Video className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{session?.title || 'Live Session'}</h2>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-400 flex items-center gap-1 font-medium">
                <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></span>
                Live
              </span>
              <span className="text-white/50">|</span>
              <span className="text-white/70 flex items-center gap-1 font-medium">
                <Users className="w-4 h-4" />
                {remoteUsersCount + 1} Participant{remoteUsersCount !== 0 ? 's' : ''}
              </span>
              <span className="text-white/50">|</span>
              <span className="text-yellow-400 font-medium">
                Teacher: {session?.teacherName || 'Instructor'}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={handleLeaveSession}
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-6 py-2.5 rounded-lg text-white font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg shadow-red-500/30 cursor-pointer"
        >
          <X className="w-5 h-5" />
          Leave Session
        </button>
      </div>

      {/* Main Video Area - Teacher Stage Only */}
      <div className="flex-1 relative flex p-4 gap-4 overflow-hidden">
        <div className="flex-1 bg-gray-900/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative flex items-center justify-center">
          {/* Dedicated Teacher Video Element */}
          <div 
            ref={teacherVideoRef} 
            className={`w-full h-full object-contain ${teacherHasVideo ? 'block' : 'hidden'}`}
          />

          {/* Teacher Offline / Camera-Off Fallback */}
          {!teacherHasVideo && (
            <div className="text-center p-8 flex flex-col items-center justify-center h-full">
              <div className="relative inline-block mb-6">
                <div className="w-32 h-32 mx-auto bg-gradient-to-r from-yellow-500 to-amber-600 rounded-full flex items-center justify-center shadow-2xl shadow-yellow-500/30 animate-pulse">
                  <Video className="w-16 h-16 text-white" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-yellow-400 rounded-full border-4 border-gray-900 flex items-center justify-center">
                  <span className="text-gray-900 text-xs font-bold">★</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {session?.teacherName || 'Teacher'}
              </h3>
              <p className="text-white/60 text-lg">
                {teacherUser 
                  ? 'Teacher camera is currently turned off (Audio Active)'
                  : 'Waiting for teacher to connect...'}
              </p>
            </div>
          )}

          {/* Teacher Overlay Badge */}
          {teacherUser && (
            <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md text-white text-sm px-3 py-1.5 rounded-full flex items-center gap-2 z-10 border border-yellow-500/30">
              <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-ping"></span>
              <span className="font-semibold text-yellow-400">Teacher:</span> {session?.teacherName || 'Instructor'}
            </div>
          )}
        </div>

        {/* Local Video (Student Preview) - DRAGGABLE WINDOW */}
        <div 
          style={{ 
            position: 'fixed',
            left: `${pipPos.x}px`,
            top: `${pipPos.y}px`,
            touchAction: 'none'
          }}
          className={`w-72 h-52 bg-gray-800 rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 z-30 transition-shadow ${
            isDraggingPip ? 'shadow-blue-500/50 ring-2 ring-blue-400' : 'hover:border-blue-400/60'
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
              <GripHorizontal className="w-4 h-4 text-blue-400" />
              <span>Drag Preview</span>
            </div>
            <span className="text-[10px] bg-blue-500/30 text-blue-300 px-1.5 py-0.5 rounded font-mono">You</span>
          </div>

          <div className="w-full h-full pt-7 relative">
            {isCameraOn && tracksRef.current.length > 0 ? (
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
              <span className="truncate max-w-[140px]">{effectiveStudentName} (You)</span>
            </div>
            {handRaised && (
              <div className="absolute top-9 right-2 bg-yellow-500 p-1.5 rounded-full animate-bounce shadow-lg z-10">
                <Hand className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Chat Panel */}
        {showChat && (
          <div className="absolute bottom-24 right-8 w-96 h-96 bg-gray-800/95 backdrop-blur-md rounded-2xl flex flex-col border border-white/10 shadow-2xl z-20">
            <div className="p-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-t-2xl flex justify-between items-center">
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
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div key={index} className={`bg-white/10 rounded-lg p-3 ${msg.isLocal ? 'border-l-4 border-blue-500' : 'border-l-4 border-yellow-500'}`}>
                    <span className={`font-semibold text-sm ${msg.isLocal ? 'text-blue-400' : 'text-yellow-400'}`}>
                      {getDisplayName(msg.sender, msg.isLocal)}: 
                    </span>
                    <span className="text-white ml-1">{msg.text}</span>
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
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-500"
                  placeholder="Type a message..."
                />
                <button 
                  onClick={sendMessage} 
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 px-5 py-3 rounded-xl text-white font-semibold transition-all cursor-pointer"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

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
          onClick={raiseHand}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg cursor-pointer ${
            handRaised 
              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600' 
              : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
          } text-white`}
        >
          <Hand className="w-5 h-5" />
          {handRaised ? 'Hand Raised' : 'Raise Hand'}
        </button>

        <button
          onClick={() => setShowChat(!showChat)}
          className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 px-6 py-3 rounded-xl text-white font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg cursor-pointer"
        >
          <MessageCircle className="w-5 h-5" />
          Chat
          {messages.length > 0 && (
            <span className="bg-white text-indigo-600 text-xs font-bold px-2 py-0.5 rounded-full">
              {messages.length}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default StudentLiveVideo;
