import React, { useEffect, useRef, useState, useCallback } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { toast } from 'react-toastify';
import Pagination from './Pagination';
import { Users, Video, VideoOff, Mic, MicOff, MessageCircle, Hand, X } from 'lucide-react';
import axios from 'axios';
import { API_BASE, LIVESESSION_PATHS } from "@/lib/api";

// Types and Interfaces
interface LiveSession {
  success: boolean;
  appId: string;
  channelName: string;
  uid: number;
  token: string;
  sessionId: string;
  title: string;
  teacherName: string;
  teacherUid: number | null;
}

interface JoinSessionResponse {
  success: boolean;
  appId: string;
  channelName: string;
  uid: number;
  token: string;
  sessionId: string;
  title: string;
  teacherName: string;
  teacherUid: number | null;
  message?: string;
}

interface ChatMessage {
  sender: string;
  text: string;
  isLocal: boolean;
  timestamp?: number;
}

interface RemoteUser {
  uid: number;
  videoTrack?: any;
  audioTrack?: any;
  hasVideo?: boolean;
  hasAudio?: boolean;
}

interface AgoraTrack {
  trackMediaType: 'video' | 'audio';
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  stop: () => void;
  close: () => void;
  play: (element: HTMLElement, config?: { fit: 'cover' | 'contain' }) => void;
}

interface GridStyle {
  gridTemplateColumns: string;
  gridTemplateRows: string;
}

interface StudentLiveVideoProps {
  sessionId: string;
  studentId: string;
  onClose: () => void;
}

// Add AgoraRTC client interface
interface IAgoraRTCClient {
  join: (appId: string, channel: string, token: string, uid: number) => Promise<void>;
  leave: () => Promise<void>;
  publish: (tracks: any[]) => Promise<void>;
  unpublish: (tracks: any[]) => Promise<void>;
  subscribe: (user: any, mediaType: string) => Promise<void>;
  remoteUsers: RemoteUser[];
  on: (event: string, listener: (...args: any[]) => void) => void;
  removeAllListeners: () => void;
  sendStreamMessage: (message: Uint8Array) => Promise<void>;
}

const StudentLiveVideo: React.FC<StudentLiveVideoProps> = ({ 
  sessionId, 
  studentId, 
  onClose 
}) => {
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteContainerRef = useRef<HTMLDivElement>(null);

  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const tracksRef = useRef<any[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [session, setSession] = useState<LiveSession | null>(null);
  const [remoteUsersCount, setRemoteUsersCount] = useState<number>(0);
  const [remoteUsers, setRemoteUsers] = useState<RemoteUser[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const [showChat, setShowChat] = useState<boolean>(false);
  const [isCameraOn, setIsCameraOn] = useState<boolean>(true);
  const [isMicOn, setIsMicOn] = useState<boolean>(true);
  const [handRaised, setHandRaised] = useState<boolean>(false);

  // Helper to get display name for chat senders
  const getDisplayName = (sender: string, isLocal: boolean): string => {
    if (isLocal) return 'You';
    
    // Default student messages to 'Student', teacher fallback
    if (sender !== 'Teacher' && !sender.toLowerCase().includes('teacher')) {
      return 'Student';
    }
    
    return 'Teacher';
  };

  const STUDENTS_PER_PAGE: number = 4;

  // Improved grid layout function for better visual arrangement
  const getGridStyle = (count: number): GridStyle => {
    if (count === 0) return { gridTemplateColumns: '1fr', gridTemplateRows: '1fr' };
    
    if (count === 1) {
      return { gridTemplateColumns: '1fr', gridTemplateRows: '1fr' };
    }
    if (count === 2) {
      return { gridTemplateColumns: 'repeat(2, 1fr)', gridTemplateRows: '1fr' };
    }
    if (count === 3) {
      return { gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: '1fr' };
    }
    if (count === 4) {
      return { gridTemplateColumns: 'repeat(2, 1fr)', gridTemplateRows: 'repeat(2, 1fr)' };
    }
    
    return { gridTemplateColumns: 'repeat(2, 1fr)', gridTemplateRows: 'repeat(2, 1fr)' };
  };

  // Calculate pagination
  const totalPages: number = Math.ceil(remoteUsersCount / STUDENTS_PER_PAGE);
  const startIndex: number = (currentPage - 1) * STUDENTS_PER_PAGE;
  const endIndex: number = startIndex + STUDENTS_PER_PAGE;
  
  const currentPageUsers: RemoteUser[] = remoteUsers.slice(startIndex, endIndex);
  const currentPageUsersCount: number = currentPageUsers.length;
  const gridStyle: GridStyle = getGridStyle(currentPageUsersCount);

  // Reset to page 1 if remote users count changes and current page is out of bounds
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [remoteUsersCount, totalPages, currentPage]);

  // Join live session
  useEffect(() => {
    const joinSession = async (): Promise<void> => {
      try {
        setIsLoading(true);
        
        // Get authentication token from localStorage
        const token = typeof window !== "undefined" ? localStorage.getItem("cp_token") : null;
        
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        
        const response = await axios.post<JoinSessionResponse>(
          `${API_BASE}${LIVESESSION_PATHS.joinSession}`, 
          {
            sessionId,
            studentId
          },
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
        console.error('Join session error:', error);
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

  // Memoized function to render remote video
  const renderRemoteVideo = useCallback((remoteUser: RemoteUser, container: HTMLElement): void => {
    if (remoteUser.videoTrack) {
      remoteUser.videoTrack.play(container, { fit: 'cover' });
    }
  }, []);

  // Clear remote container and re-render only current page users
  const renderCurrentPageUsers = useCallback((): void => {
    if (!remoteContainerRef.current) return;
    
    remoteContainerRef.current.innerHTML = '';
    
    const usersToRender = remoteUsers.slice(startIndex, endIndex);
    
    usersToRender.forEach((remoteUser) => {
      if (remoteUser.videoTrack) {
        const remoteDiv = document.createElement('div');
        remoteDiv.id = `remote-${remoteUser.uid}`;
        remoteDiv.className = 'relative w-full h-full bg-gray-800 rounded-lg overflow-hidden';
        
        // Add user info overlay
        const infoDiv = document.createElement('div');
        infoDiv.className = 'absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-sm px-2 py-1 rounded flex items-center gap-1';
        
        // Check if it's the teacher
        const isTeacher = remoteUser.uid === session?.teacherUid;
        infoDiv.innerHTML = `<span class="w-2 h-2 ${isTeacher ? 'bg-yellow-500' : 'bg-green-500'} rounded-full"></span> ${isTeacher ? 'Teacher' : 'Student'}`;
        remoteDiv.appendChild(infoDiv);

        if (remoteContainerRef.current) {
          remoteContainerRef.current.appendChild(remoteDiv);
        }

        setTimeout(() => {
          if (remoteUser.videoTrack && remoteDiv) {
            renderRemoteVideo(remoteUser, remoteDiv);
          }
        }, 100);
      }
    });
  }, [remoteUsers, startIndex, endIndex, renderRemoteVideo, session?.teacherUid]);

  // Re-render when page changes
  useEffect(() => {
    if (remoteUsersCount > 0) {
      renderCurrentPageUsers();
    }
  }, [currentPage, renderCurrentPageUsers, remoteUsersCount]);

  useEffect(() => {
    if (!session) return;

    let mounted = true;

    const initAgora = async (): Promise<void> => {
      try {
        setIsLoading(true);

        const client = AgoraRTC.createClient({
          mode: 'rtc',
          codec: 'vp8',
        }) as unknown as IAgoraRTCClient;

        clientRef.current = client;

        // USER PUBLISHED
        const userPublishedHandler = async (remoteUser: RemoteUser, mediaType: string): Promise<void> => {
          if (!mounted) return;
          try {
            await client.subscribe(remoteUser, mediaType);
            if (!mounted) return;

            if (mediaType === 'video') {
              const newCount = client.remoteUsers.length;
              setRemoteUsersCount(newCount);
              
              setRemoteUsers(prev => {
                const exists = prev.some(u => u.uid === remoteUser.uid);
                if (exists) return prev;
                return [...prev, remoteUser];
              });

              const remoteDiv = document.createElement('div');
              remoteDiv.id = `remote-${remoteUser.uid}`;
              remoteDiv.className = 'relative w-full h-full bg-gray-800 rounded-lg overflow-hidden';
              
              const infoDiv = document.createElement('div');
              infoDiv.className = 'absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-sm px-2 py-1 rounded flex items-center gap-1';
              
              const isTeacher = remoteUser.uid === session.teacherUid;
              infoDiv.innerHTML = `<span class="w-2 h-2 ${isTeacher ? 'bg-yellow-500' : 'bg-green-500'} rounded-full"></span> ${isTeacher ? 'Teacher' : 'Student'}`;
              remoteDiv.appendChild(infoDiv);

              if (remoteContainerRef.current && mounted) {
                remoteContainerRef.current.appendChild(remoteDiv);
              }

              setTimeout(() => {
                if (mounted && remoteUser.videoTrack) {
                  remoteUser.videoTrack.play(remoteDiv, { fit: 'cover' });
                }
              }, 100);
            }

            if (mediaType === 'audio' && mounted && remoteUser.audioTrack) {
              remoteUser.audioTrack.play();
            }
          } catch (error) {
            if (mounted && error instanceof Error && 
                !error.message?.includes('cancel token canceled') && 
                !error.message?.includes('OPERATION_ABORTED')) {
              console.error('Subscribe error:', error);
            }
          }
        };

        // USER UNPUBLISHED
        const userUnpublishedHandler = (remoteUser: RemoteUser): void => {
          const remoteDiv = document.getElementById(`remote-${remoteUser.uid}`);
          if (remoteDiv) remoteDiv.remove();

          const newCount = Math.max(0, client.remoteUsers.length);
          setRemoteUsersCount(newCount);
          
          setRemoteUsers(prev => prev.filter(u => u.uid !== remoteUser.uid));
        };

        // USER LEFT
        const userLeftHandler = (remoteUser: RemoteUser): void => {
          const remoteDiv = document.getElementById(`remote-${remoteUser.uid}`);
          if (remoteDiv) remoteDiv.remove();

          const newCount = Math.max(0, client.remoteUsers.length - 1);
          setRemoteUsersCount(newCount);
          
          setRemoteUsers(prev => prev.filter(u => u.uid !== remoteUser.uid));
        };

        // STREAM MESSAGE - Receive messages
        const streamMessageHandler = (remoteUser: RemoteUser, message: Uint8Array): void => {
          if (!mounted) return;
          try {
            const text = new TextDecoder().decode(message);
            const msgData = JSON.parse(text);
            
            setMessages(prev => [...prev, { 
              sender: msgData.sender || 'Teacher', 
              text: msgData.text,
              isLocal: false,
              timestamp: msgData.timestamp || Date.now()
            }]);
          } catch (error) {
            try {
              const text = new TextDecoder().decode(message);
              setMessages(prev => [...prev, { 
                sender: 'Teacher', 
                text: text,
                isLocal: false,
                timestamp: Date.now()
              }]);
            } catch (e) {
              console.error('Error parsing message:', e);
            }
          }
        };

        client.on('user-published', userPublishedHandler);
        client.on('user-unpublished', userUnpublishedHandler);
        client.on('user-left', userLeftHandler);
        client.on('stream-message', streamMessageHandler);

        // Join channel
        if (!mounted) return;
        await client.join(
          session.appId,
          session.channelName,
          session.token,
          session.uid
        );

        // Handle existing remote users
        if (!mounted) return;
        const existingUsers = client.remoteUsers;
        setRemoteUsers(existingUsers);
        setRemoteUsersCount(existingUsers.length);
        
        for (const remoteUser of existingUsers) {
          if (!mounted) return;
          await client.subscribe(remoteUser, 'video');
          if (!mounted) return;
          await client.subscribe(remoteUser, 'audio');

          if (remoteUser.hasVideo) {
            const remoteDiv = document.createElement('div');
            remoteDiv.id = `remote-${remoteUser.uid}`;
            remoteDiv.className = 'relative w-full h-full bg-gray-800 rounded-lg overflow-hidden';

            const infoDiv = document.createElement('div');
            infoDiv.className = 'absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-sm px-2 py-1 rounded flex items-center gap-1';
            
            const isTeacher = remoteUser.uid === session.teacherUid;
            infoDiv.innerHTML = `<span class="w-2 h-2 ${isTeacher ? 'bg-yellow-500' : 'bg-green-500'} rounded-full"></span> ${isTeacher ? 'Teacher' : 'Student'}`;
            remoteDiv.appendChild(infoDiv);

            if (remoteContainerRef.current) {
              remoteContainerRef.current.appendChild(remoteDiv);
            }

            setTimeout(() => {
              if (remoteUser.videoTrack) {
                remoteUser.videoTrack.play(remoteDiv, { fit: 'cover' });
              }
            }, 100);
          }

          if (remoteUser.hasAudio && remoteUser.audioTrack) {
            remoteUser.audioTrack.play();
          }
        }

        // Student can optionally publish their own video/audio
        try {
          if (!mounted) return;
          await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });

          if (!mounted) return;
          const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();

          tracksRef.current = [audioTrack, videoTrack];

          setTimeout(() => {
            if (localVideoRef.current) {
              videoTrack.play(localVideoRef.current, { fit: 'cover' });
            }
          }, 100);

          if (!mounted) return;
          await client.publish([audioTrack, videoTrack]);
        } catch (mediaError) {
          // console.log('Student opted not to share media or media error:', mediaError);
          // Continue without publishing - student can be viewer only
        }

        if (mounted) {
          setIsLoading(false);
          toast.success('Connected to live session!');
        }
      } catch (error) {
        console.error('Agora Init Error:', error);
        if (error instanceof Error && 
            (error.message?.includes('cancel token canceled') || 
             error.message?.includes('OPERATION_ABORTED'))) {
          // console.log('Agora operation aborted');
          return;
        }
        if (mounted) {
          toast.error('Failed to connect to live session');
          setIsLoading(false);
        }
      }
    };

    initAgora();

    return () => {
      mounted = false;

      tracksRef.current.forEach((track) => {
        if (track) {
          track.stop();
          track.close();
        }
      });
      tracksRef.current = [];

      if (remoteContainerRef.current) {
        remoteContainerRef.current.innerHTML = '';
      }

      if (clientRef.current) {
        clientRef.current.removeAllListeners();
        clientRef.current.leave();
      }

      setRemoteUsersCount(0);
      setRemoteUsers([]);
      setCurrentPage(1);
    };
  }, [session, renderRemoteVideo]);

  const toggleCamera = (): void => {
    const videoTrack = tracksRef.current.find(
      (track) => track && track.trackMediaType === 'video'
    );
    if (videoTrack) {
      const newState = !videoTrack.enabled;
      videoTrack.setEnabled(newState);
      setIsCameraOn(newState);
    }
  };

  const toggleMic = (): void => {
    const audioTrack = tracksRef.current.find(
      (track) => track && track.trackMediaType === 'audio'
    );
    if (audioTrack) {
      const newState = !audioTrack.enabled;
      audioTrack.setEnabled(newState);
      setIsMicOn(newState);
    }
  };

  const raiseHand = (): void => {
    setHandRaised(!handRaised);
    toast.info(handRaised ? 'Hand lowered' : 'Hand raised!');
    
    if (clientRef.current) {
      const messageData = JSON.stringify({
        type: 'hand_raise',
        studentId: studentId,
        isRaised: !handRaised,
        timestamp: Date.now()
      });
      
      const encoder = new TextEncoder();
      const messageBytes = encoder.encode(messageData);
      
      clientRef.current.sendStreamMessage(messageBytes).catch(console.error);
    }
  };

  const sendMessage = async (): Promise<void> => {
    if (input.trim() && clientRef.current) {
      const messageText = input.trim();
      
      const messageData = JSON.stringify({
        sender: studentId, // Send actual ID, display handled client-side
        text: messageText,
        timestamp: Date.now()
      });
      
      const encoder = new TextEncoder();
      const messageBytes = encoder.encode(messageData);
      
      try {
        await clientRef.current.sendStreamMessage(messageBytes);
        
        setMessages(prev => [...prev, { 
          sender: 'You', 
          text: messageText,
          isLocal: true,
          timestamp: Date.now()
        }]);
        
        setInput('');
      } catch (error) {
        console.error('Error sending message:', error);
        setMessages(prev => [...prev, { 
          sender: 'You', 
          text: messageText,
          isLocal: true,
          timestamp: Date.now()
        }]);
        setInput('');
      }
    }
  };

  const handleLeaveSession = async (): Promise<void> => {
    try {
      tracksRef.current.forEach((track) => {
        if (track) {
          track.stop();
          track.close();
        }
      });

      if (clientRef.current) {
        await clientRef.current.leave();
        clientRef.current.removeAllListeners();
      }

      toast.success('Left session');
      onClose();
    } catch (error) {
      console.error('Leave session error:', error);
      toast.error('Failed to leave session');
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
      <div className="flex justify-between items-center px-6 py-4 bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-lg">
            <Video className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{session?.title || 'Live Session'}</h2>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-400 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Live
              </span>
              <span className="text-white/50">|</span>
              <span className="text-white/70 flex items-center gap-1">
                <Users className="w-4 h-4" />
                {remoteUsersCount} Participant{remoteUsersCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={handleLeaveSession}
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-6 py-2.5 rounded-lg text-white font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg shadow-red-500/30"
        >
          <X className="w-5 h-5" />
          Leave Session
        </button>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative flex p-4 gap-4">
        {/* Remote Videos - Main screen for teacher only */}
        <div
          ref={remoteContainerRef}
          className="flex-1 bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
        >
          {remoteUsersCount === 0 && (
            <div className="text-center p-8 flex flex-col items-center justify-center h-full">
              <div className="relative inline-block mb-6">
                <div className="w-32 h-32 mx-auto bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/50">
                  <Video className="w-16 h-16 text-white" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-yellow-500 rounded-full border-4 border-gray-900 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">Teacher</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Teacher Screen Share</h3>
              <p className="text-white/60 text-lg">Main content appears here</p>
              <div className="mt-6 flex gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></span>
                <span className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              </div>
            </div>
          )}
        </div>

        {/* Local Video (Student) */}
        <div className="absolute top-6 right-6 w-72 h-54 bg-gray-800 rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 z-10">
          {isCameraOn && tracksRef.current.length > 0 ? (
            <div ref={localVideoRef} className="w-full h-full" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-gray-700 to-gray-800 flex items-center justify-center">
              <div className="text-center">
                <VideoOff className="w-12 h-12 text-white/50 mx-auto mb-2" />
                <p className="text-white/50 text-sm">Camera Off</p>
              </div>
            </div>
          )}
          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-full flex items-center gap-2">
            {isMicOn ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3 text-red-400" />}
            You (Student)
          </div>
          {handRaised && (
            <div className="absolute top-2 right-2 bg-yellow-500 p-1.5 rounded-full animate-pulse">
              <Hand className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        {/* Chat Panel */}
        {showChat && (
          <div className="absolute bottom-24 right-6 w-96 h-96 bg-gray-800/95 backdrop-blur-md rounded-2xl flex flex-col border border-white/10 shadow-2xl z-20">
            <div className="p-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-t-2xl flex justify-between items-center">
              <span className="font-semibold flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Chat
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
                  <div key={index} className={`bg-white/10 rounded-lg p-3 ${msg.isLocal ? 'border-l-4 border-blue-500' : ''}`}>
                    <span className={`font-semibold text-sm ${msg.isLocal ? 'text-blue-400' : 'text-purple-400'}`}>
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                  onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && sendMessage()}
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-500"
                  placeholder="Type a message..."
                />
                <button 
                  onClick={sendMessage} 
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 px-5 py-3 rounded-xl text-white font-semibold transition-all"
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
            <div className="text-white/70">
              Showing {startIndex + 1}-{Math.min(endIndex, remoteUsersCount)} of {remoteUsersCount} participants
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
          } text-white shadow-lg`}
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
          } text-white shadow-lg`}
        >
          {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          {isMicOn ? 'Mic' : 'Mic Off'}
        </button>

        <button
          onClick={raiseHand}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg ${
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
          className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 px-6 py-3 rounded-xl text-white font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg"
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