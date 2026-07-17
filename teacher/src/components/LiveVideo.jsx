import React, { useEffect, useRef, useState, useCallback } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { toast } from 'react-toastify';
import Pagination from './Pagination';
import { Users, Video, VideoOff, Mic, MicOff, MessageCircle, Monitor, X } from 'lucide-react';

const LiveVideo = ({ session, onClose }) => {
  const localVideoRef = useRef(null);
  const remoteContainerRef = useRef(null);

  const clientRef = useRef(null);
  const tracksRef = useRef([]);

  const [isLoading, setIsLoading] = useState(true);
  const [remoteUsersCount, setRemoteUsersCount] = useState(0);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const screenTrackRef = useRef(null);

  const STUDENTS_PER_PAGE = 4;

  // Improved grid layout function for better visual arrangement
  const getGridStyle = (count) => {
    if (count === 0) return { gridTemplateColumns: '1fr', gridTemplateRows: '1fr' };
    
    // For 1-4 students, use specific layouts
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
    
    // For more than 4, use 2x2 grid per page
    return { gridTemplateColumns: 'repeat(2, 1fr)', gridTemplateRows: 'repeat(2, 1fr)' };
  };

  // Calculate pagination
  const totalPages = Math.ceil(remoteUsersCount / STUDENTS_PER_PAGE);
  const startIndex = (currentPage - 1) * STUDENTS_PER_PAGE;
  const endIndex = startIndex + STUDENTS_PER_PAGE;
  
  // Get current page users for grid calculation
  const currentPageUsers = remoteUsers.slice(startIndex, endIndex);
  const currentPageUsersCount = currentPageUsers.length;
  
  // Get grid style based on current page user count
  const gridStyle = getGridStyle(currentPageUsersCount);

  // Reset to page 1 if remote users count changes and current page is out of bounds
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [remoteUsersCount, totalPages, currentPage]);

  // Memoized function to render remote video
  const renderRemoteVideo = useCallback((remoteUser, container) => {
    if (remoteUser.videoTrack) {
      remoteUser.videoTrack.play(container, { fit: 'cover' });
    }
  }, []);

  // Clear remote container and re-render only current page users
  const renderCurrentPageUsers = useCallback(() => {
    if (!remoteContainerRef.current) return;
    
    // Clear existing video elements
    remoteContainerRef.current.innerHTML = '';
    
    // Get users for current page
    const usersToRender = remoteUsers.slice(startIndex, endIndex);
    
    // Render each user in the current page
    usersToRender.forEach((remoteUser) => {
      if (remoteUser.videoTrack) {
        const remoteDiv = document.createElement('div');
        remoteDiv.id = `remote-${remoteUser.uid}`;
        remoteDiv.className = 'relative w-full h-full bg-gray-800 rounded-lg overflow-hidden';
        
        // Add user info overlay
        const infoDiv = document.createElement('div');
        infoDiv.className = 'absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-sm px-2 py-1 rounded flex items-center gap-1';
        infoDiv.innerHTML = `<span class="w-2 h-2 bg-green-500 rounded-full"></span> Student`;
        remoteDiv.appendChild(infoDiv);

        if (remoteContainerRef.current) {
          remoteContainerRef.current.appendChild(remoteDiv);
        }

        // Add delay to ensure div is ready for video play
        setTimeout(() => {
          if (remoteUser.videoTrack && remoteDiv) {
            renderRemoteVideo(remoteUser, remoteDiv);
          }
        }, 100);
      }
    });
  }, [remoteUsers, startIndex, endIndex, renderRemoteVideo]);

  // Re-render when page changes
  useEffect(() => {
    if (remoteUsersCount > 0) {
      renderCurrentPageUsers();
    }
  }, [currentPage, renderCurrentPageUsers, remoteUsersCount]);

  // Effect to handle remote users changes without re-rendering all
  useEffect(() => {
    if (remoteUsersCount > 0 && currentPageUsersCount > 0) {
      // Only update if we're on the correct page for the new user
      const lastUserIndex = remoteUsers.length - 1;
      const lastUserPage = Math.floor(lastUserIndex / STUDENTS_PER_PAGE) + 1;
      
      if (lastUserPage === currentPage) {
        renderCurrentPageUsers();
      }
    }
  }, [remoteUsers.length, remoteUsersCount, currentPage, currentPageUsersCount, renderCurrentPageUsers]);

  useEffect(() => {
    if (!session) return;

    let mounted = true;
    let userPublishedHandler = null;
    let userUnpublishedHandler = null;
    let userLeftHandler = null;

    const initAgora = async () => {
      try {
        setIsLoading(true);

        const client = AgoraRTC.createClient({
          mode: 'rtc',
          codec: 'vp8',
        });

        clientRef.current = client;

        // 🔥 USER PUBLISHED
        userPublishedHandler = async (remoteUser, mediaType) => {
          if (!mounted) return;
          try {
            await client.subscribe(remoteUser, mediaType);
            if (!mounted) return;

            if (mediaType === 'video') {
              const newCount = client.remoteUsers.length;
              setRemoteUsersCount(newCount);
              toast.info('A student joined the session');
              
              // Add user to remoteUsers array - use functional update to avoid stale state
              setRemoteUsers(prev => {
                // Check if user already exists
                const exists = prev.some(u => u.uid === remoteUser.uid);
                if (exists) return prev;
                return [...prev, remoteUser];
              });

              const remoteDiv = document.createElement('div');
              remoteDiv.id = `remote-${remoteUser.uid}`;
              remoteDiv.className = 'relative w-full h-full bg-gray-800 rounded-lg overflow-hidden';
              
              // Add user info overlay
              const infoDiv = document.createElement('div');
              infoDiv.className = 'absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-sm px-2 py-1 rounded flex items-center gap-1';
              infoDiv.innerHTML = `<span class="w-2 h-2 bg-green-500 rounded-full"></span> Student`;
              remoteDiv.appendChild(infoDiv);

              if (remoteContainerRef.current && mounted) {
                remoteContainerRef.current.appendChild(remoteDiv);
              }

              // Add delay to ensure div is ready for video play
              setTimeout(() => {
                if (mounted && remoteUser.videoTrack) {
                  remoteUser.videoTrack.play(remoteDiv, { fit: 'cover' });
                }
              }, 100);
            }

            if (mediaType === 'audio' && mounted) {
              remoteUser.audioTrack.play();
            }
          } catch (error) {
            if (mounted && !error.message?.includes('cancel token canceled') && !error.message?.includes('OPERATION_ABORTED')) {
              console.error('Subscribe error:', error);
            }
          }
        };

        // 🔥 USER UNPUBLISHED
        userUnpublishedHandler = (remoteUser) => {
          const remoteDiv = document.getElementById(`remote-${remoteUser.uid}`);
          if (remoteDiv) remoteDiv.remove();

          const newCount = Math.max(0, client.remoteUsers.length);
          setRemoteUsersCount(newCount);
          
          // Remove user from remoteUsers array
          setRemoteUsers(prev => prev.filter(u => u.uid !== remoteUser.uid));
        };

        // 🔥 USER LEFT
        userLeftHandler = (remoteUser) => {
          toast.info('A student left the session');
          const remoteDiv = document.getElementById(`remote-${remoteUser.uid}`);
          if (remoteDiv) remoteDiv.remove();

          const newCount = Math.max(0, client.remoteUsers.length - 1);
          setRemoteUsersCount(newCount);
          
          // Remove user from remoteUsers array
          setRemoteUsers(prev => prev.filter(u => u.uid !== remoteUser.uid));
        };

        // 🔥 STREAM MESSAGE - Receive messages from students
        client.on('stream-message', (remoteUser, message) => {
          if (!mounted) return;
          try {
            // Decode the message
            const text = new TextDecoder().decode(message);
            const msgData = JSON.parse(text);
            
            if (msgData.type === 'hand_raise') {
              const remoteDiv = document.getElementById(`remote-${remoteUser.uid}`);
              const handIconId = `hand-${remoteUser.uid}`;
              
              if (msgData.isRaised) {
                toast.info(`A student raised a hand!`);
                
                if (remoteDiv && !document.getElementById(handIconId)) {
                  const handIcon = document.createElement('div');
                  handIcon.id = handIconId;
                  handIcon.className = 'absolute top-2 right-2 bg-blue-500 text-white p-1.5 rounded-full shadow-lg z-10 animate-bounce cursor-pointer text-xl';
                  handIcon.innerHTML = '✋';
                  handIcon.title = 'Click to acknowledge and remove';
                  handIcon.onclick = () => handIcon.remove();
                  
                  remoteDiv.appendChild(handIcon);
                }
              } else {
                const existingHand = document.getElementById(handIconId);
                if (existingHand) {
                  existingHand.remove();
                }
              }
              return; // Do not add hand raise as a chat message
            }

            // Add message to state
            setMessages(prev => [...prev, { 
              sender: msgData.sender || 'Student', 
              text: msgData.text,
              isLocal: false
            }]);
          } catch (error) {
            // If not JSON, treat as plain text
            try {
              const text = new TextDecoder().decode(message);
              setMessages(prev => [...prev, { 
                sender: 'Student', 
                text: text,
                isLocal: false
              }]);
            } catch (e) {
              console.error('Error parsing message:', e);
            }
          }
        });

        client.on('user-published', userPublishedHandler);
        client.on('user-unpublished', userUnpublishedHandler);
        client.on('user-left', userLeftHandler);

        // Join channel
        if (!mounted) return;
        await client.join(
          session.appId,
          session.channelName,
          session.token,
          session.uid
        );

        // Handle existing remote users on rejoin
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

            // Add user info overlay
            const infoDiv = document.createElement('div');
            infoDiv.className = 'absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-sm px-2 py-1 rounded flex items-center gap-1';
            infoDiv.innerHTML = `<span class="w-2 h-2 bg-green-500 rounded-full"></span> Student`;
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

          if (remoteUser.hasAudio) {
            remoteUser.audioTrack.play();
          }
        }

        if (!mounted) return;
        await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (!mounted) return;
        const [audioTrack, videoTrack] =
          await AgoraRTC.createMicrophoneAndCameraTracks();

        tracksRef.current = [audioTrack, videoTrack];

        setTimeout(() => {
          if (localVideoRef.current) {
            videoTrack.play(localVideoRef.current, { fit: 'cover' });
          }
        }, 100);

        if (!mounted) return;
        await client.publish([audioTrack, videoTrack]);

        if (mounted) {
          setIsLoading(false);
          toast.success('Live streaming started!');
        }
      } catch (error) {
        console.error('Agora Init Error:', error);
        if (error.message && (error.message.includes('cancel token canceled') || error.message.includes('OPERATION_ABORTED'))) {
          // console.log('Agora operation aborted - likely due to component unmount or session change');
          return;
        }
        if (mounted) {
          toast.error('Failed to start live streaming');
          setIsLoading(false);
        }
      }
    };

    const handleBeforeUnload = () => {
      // Synchronous cleanup for beforeunload
      tracksRef.current.forEach((track) => {
        if (track) {
          track.stop();
          track.close();
        }
      });
      if (clientRef.current) {
        clientRef.current.leave();
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);

    initAgora();

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      mounted = false;

      // Stop & close tracks
      tracksRef.current.forEach((track) => {
        if (track) {
          track.stop();
          track.close();
        }
      });
      tracksRef.current = [];

      // Clear remote container
      if (remoteContainerRef.current) {
        remoteContainerRef.current.innerHTML = '';
      }

      // Remove listeners & leave
      if (clientRef.current) {
        clientRef.current.removeAllListeners();
        clientRef.current.leave();
      }

      setRemoteUsersCount(0);
      setRemoteUsers([]);
      setCurrentPage(1);
    };
  }, [session, renderRemoteVideo]);

  const handleEndStream = async () => {
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

      toast.success('Live streaming ended');
      onClose();
    } catch (error) {
      console.error('End stream error:', error);
      toast.error('Failed to end stream');
    }
  };

  const toggleCamera = () => {
    const videoTrack = tracksRef.current.find(
      (track) => track && track.trackMediaType === 'video'
    );
    if (videoTrack) {
      const newState = !videoTrack.enabled;
      videoTrack.setEnabled(newState);
      setIsCameraOn(newState);
    }
  };

  const toggleMic = () => {
    const audioTrack = tracksRef.current.find(
      (track) => track && track.trackMediaType === 'audio'
    );
    if (audioTrack) {
      const newState = !audioTrack.enabled;
      audioTrack.setEnabled(newState);
      setIsMicOn(newState);
    }
  };

  const sendMessage = async () => {
    if (input.trim() && clientRef.current) {
      const messageText = input.trim();
      
      // Create message payload
      const messageData = JSON.stringify({
        sender: 'Teacher',
        text: messageText,
        timestamp: Date.now()
      });
      
      // Convert string to Uint8Array for Agora stream message
      const encoder = new TextEncoder();
      const messageBytes = encoder.encode(messageData);
      
      try {
        // Send stream message to all participants
        await clientRef.current.sendStreamMessage(messageBytes);
        
        // Add to local messages
        setMessages(prev => [...prev, { 
          sender: 'You (Teacher)', 
          text: messageText,
          isLocal: true
        }]);
        
        setInput('');
      } catch (error) {
        console.error('Error sending message:', error);
        // Fallback - still show message locally even if sending fails
        setMessages(prev => [...prev, { 
          sender: 'You (Teacher)', 
          text: messageText,
          isLocal: true
        }]);
        setInput('');
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        // Stop screen sharing and restore camera
        if (screenTrackRef.current) {
          await clientRef.current.unpublish(screenTrackRef.current);
          screenTrackRef.current.stop();
          screenTrackRef.current.close();
          screenTrackRef.current = null;
        }
        
        // Re-publish camera track
        const videoTrack = tracksRef.current.find(
          (track) => track && track.trackMediaType === 'video'
        );
        if (videoTrack) {
          await clientRef.current.publish(videoTrack);
        }
        
        setIsScreenSharing(false);
        toast.success('Screen sharing stopped');
      } else {
        // Stop camera track first
        const videoTrack = tracksRef.current.find(
          (track) => track && track.trackMediaType === 'video'
        );
        if (videoTrack) {
          await clientRef.current.unpublish(videoTrack);
        }
        
        // Create screen share track
        const screenTrack = await AgoraRTC.createScreenVideoTrack({
          encoderConfig: '1080p_1',
        });
        screenTrackRef.current = screenTrack;
   
        // Handle track ended event (when user stops sharing via browser)
        screenTrack.on('track-ended', async () => {
          try {
            if (screenTrackRef.current) {
              await clientRef.current.unpublish(screenTrackRef.current);
              screenTrackRef.current.stop();
              screenTrackRef.current.close();
              screenTrackRef.current = null;
            }
            
            // Re-publish camera track
            const videoTrack = tracksRef.current.find(
              (track) => track && track.trackMediaType === 'video'
            );
            if (videoTrack) {
              await clientRef.current.publish(videoTrack);
            }
            
            setIsScreenSharing(false);
            toast.info('Screen sharing ended by user');
          } catch (err) {
            console.error('Error handling track-ended:', err);
          }
        });
        
        await clientRef.current.publish(screenTrack);
        setIsScreenSharing(true);
        toast.success('Screen sharing started');
      }
    } catch (error) {
      console.error('Screen share error:', error);
      
      // If error, try to restore camera
      if (!isScreenSharing) {
        const videoTrack = tracksRef.current.find(
          (track) => track && track.trackMediaType === 'video'
        );
        if (videoTrack) {
          try {
            await clientRef.current.publish(videoTrack);
          } catch (pubError) {
            console.error('Error re-publishing camera:', pubError);
          }
        }
      }
      
      if (error.message?.includes('CAN_NOT_PUBLISH_MULTIPLE_VIDEO_TRACKS')) {
        toast.error('Please stop camera first before sharing screen');
      } else {
        toast.error('Failed to start screen share');
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
              <span className="text-green-400 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Live
              </span>
              <span className="text-white/50">|</span>
              <span className="text-white/70 flex items-center gap-1">
                <Users className="w-4 h-4" />
                {remoteUsersCount} Student{remoteUsersCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={handleEndStream}
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-6 py-2.5 rounded-lg text-white font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg shadow-red-500/30"
        >
          <X className="w-5 h-5" />
          End Stream
        </button>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative flex p-4 gap-4">
        {/* Remote Videos / Teacher Screen */}
        <div
          ref={remoteContainerRef}
          className={`flex-1 bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 shadow-2xl ${
            remoteUsersCount > 0 ? 'grid' : 'flex items-center justify-center'
          }`}
          style={gridStyle}
        >
          {remoteUsersCount === 0 && (
            <div className="text-center p-8">
              <div className="relative inline-block mb-6">
                <div className="w-32 h-32 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/50">
                  <Video className="w-16 h-16 text-white" />
                </div>
                <div className="absolute bottom-0 right-0 w-10 h-10 bg-green-500 rounded-full border-4 border-gray-900 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">You</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Waiting for Students</h3>
              <p className="text-white/60 text-lg">Students will appear here when they join the class</p>
              <div className="mt-6 flex justify-center gap-2">
                <span className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></span>
                <span className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                <span className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              </div>
            </div>
          )}
        </div>

        {/* Local Video (Teacher) - Always visible */}
        <div className="absolute top-6 right-6 w-72 h-54 bg-gray-800 rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 z-10">
          {isCameraOn ? (
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
            You (Teacher)
          </div>
          {!isCameraOn && (
            <div className="absolute top-2 right-2 bg-red-500 p-1.5 rounded-full">
              <VideoOff className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        {/* Chat Panel */}
        {showChat && (
          <div className="absolute bottom-24 right-6 w-96 h-96 bg-gray-800/95 backdrop-blur-md rounded-2xl flex flex-col border border-white/10 shadow-2xl z-20">
            <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-2xl flex justify-between items-center">
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
                  <div key={index} className="bg-white/10 rounded-lg p-3">
                    <span className="text-purple-400 font-semibold text-sm">{msg.sender}: </span>
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
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-5 py-3 rounded-xl text-white font-semibold transition-all"
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
          onClick={() => setShowChat(!showChat)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-6 py-3 rounded-xl text-white font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg"
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
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg ${
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
