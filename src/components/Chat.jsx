import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Divider,
  CircularProgress,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { messagesAPI } from '../services/api';

const Chat = ({ claimId }) => {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    fetchMessages();
  }, [claimId]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Rejoindre la room
    socket.emit('join-claim', claimId);

    // Écouter les nouveaux messages
    socket.on('new-message', (message) => {
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
    });

    // Écouter l'indicateur "en train d'écrire"
    socket.on('user-typing', ({ userId, isTyping: typing }) => {
      if (userId !== user._id) {
        setIsTyping(typing);
      }
    });

    // Cleanup
    return () => {
      socket.emit('leave-claim', claimId);
      socket.off('new-message');
      socket.off('user-typing');
    };
  }, [socket, isConnected, claimId, user._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await messagesAPI.getByClaimId(claimId);
      setMessages(response.data.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTyping = () => {
    if (!socket || !isConnected) return;

    socket.emit('typing', { claimId, isTyping: true });

    // Arrêter l'indicateur après 1 seconde d'inactivité
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', { claimId, isTyping: false });
    }, 1000);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || sending || !socket || !isConnected) return;

    setSending(true);
    socket.emit('send-message', {
      claimId,
      message: newMessage.trim(),
    });

    setNewMessage('');
    setSending(false);
    socket.emit('typing', { claimId, isTyping: false });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getRoleLabel = (role) => {
    const labels = {
      pharmacy: 'Pharmacie',
      depot_manager: 'Dépôt',
      laboratory: 'Laboratoire',
    };
    return labels[role] || role;
  };

  const getInitials = (sender) => {
    if (sender.firstName && sender.lastName) {
      return `${sender.firstName[0]}${sender.lastName[0]}`;
    }
    if (sender.companyName) {
      return sender.companyName.substring(0, 2).toUpperCase();
    }
    return sender.email[0].toUpperCase();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6">
          Discussion {!isConnected && '(Déconnecté)'}
        </Typography>
      </Box>

      <Divider />

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {messages.length === 0 ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <Typography color="text.secondary">
              Aucun message. Commencez la conversation !
            </Typography>
          </Box>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId._id === user._id;
            return (
              <Box
                key={message._id}
                sx={{
                  display: 'flex',
                  justifyContent: isOwn ? 'flex-end' : 'flex-start',
                  gap: 1,
                }}
              >
                {!isOwn && (
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {getInitials(message.senderId)}
                  </Avatar>
                )}
                <Box
                  sx={{
                    maxWidth: '70%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isOwn ? 'flex-end' : 'flex-start',
                  }}
                >
                  {!isOwn && (
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                      {message.senderId.companyName ||
                        `${message.senderId.firstName} ${message.senderId.lastName}`}{' '}
                      · {getRoleLabel(message.senderRole)}
                    </Typography>
                  )}
                  <Paper
                    sx={{
                      p: 1.5,
                      bgcolor: isOwn ? 'primary.main' : 'grey.200',
                      color: isOwn ? 'white' : 'text.primary',
                    }}
                  >
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {message.message}
                    </Typography>
                  </Paper>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    {format(new Date(message.createdAt), 'HH:mm', { locale: fr })}
                  </Typography>
                </Box>
                {isOwn && (
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    {getInitials(message.senderId)}
                  </Avatar>
                )}
              </Box>
            );
          })
        )}
        {isTyping && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              En train d'écrire...
            </Typography>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      <Divider />

      {/* Input */}
      <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          multiline
          maxRows={3}
          placeholder="Écrivez votre message..."
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            handleTyping();
          }}
          onKeyPress={handleKeyPress}
          disabled={!isConnected}
        />
        <IconButton
          color="primary"
          onClick={handleSendMessage}
          disabled={!newMessage.trim() || sending || !isConnected}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default Chat;
