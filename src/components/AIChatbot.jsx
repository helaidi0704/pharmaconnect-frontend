import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Fab,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Zoom,
  Collapse,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  SmartToy as BotIcon,
  Close as CloseIcon,
  Send as SendIcon,
  Minimize as MinimizeIcon,
} from '@mui/icons-material';
import { chatbotAPI } from '../services/api';
import { useSnackbar } from 'notistack';
import { useAuth } from '../contexts/AuthContext';

const AIChatbot = () => {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Bonjour! Je suis votre assistant PharmaConnect. Comment puis-je vous aider aujourd'hui? Je peux vous fournir des informations sur les réclamations, les dépôts, les stocks et bien plus encore.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const messagesEndRef = useRef(null);
  const { enqueueSnackbar } = useSnackbar();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleToggleChat = () => {
    setOpen(!open);
    setMinimized(false);
  };

  const handleMinimize = () => {
    setMinimized(!minimized);
  };

  const handleClose = () => {
    setOpen(false);
    setMinimized(false);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message to UI
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await chatbotAPI.sendMessage({
        message: userMessage,
        conversationHistory,
      });

      // Add assistant response to UI
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response.data.data.message },
      ]);

      // Update conversation history
      setConversationHistory(response.data.data.conversationHistory);
    } catch (error) {
      console.error('Chatbot error:', error);
      enqueueSnackbar(
        error.response?.data?.error?.message || 'Erreur lors de la communication avec le chatbot',
        { variant: 'error' }
      );
      // Add error message to UI
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "Désolé, j'ai rencontré une erreur. Veuillez réessayer.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedQuestions = [
    'Combien de réclamations sont en cours?',
    'Quels sont les produits en stock faible?',
    'Afficher les réclamations urgentes',
    'Informations sur les dépôts',
  ];

  const handleSuggestedQuestion = (question) => {
    setInput(question);
  };

  // Only show chatbot for authenticated users
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Chat Window */}
      <Zoom in={open}>
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 90,
            right: 24,
            width: 380,
            height: minimized ? 60 : 550,
            display: open ? 'flex' : 'none',
            flexDirection: 'column',
            zIndex: 1300,
            borderRadius: 3,
            overflow: 'hidden',
            transition: 'height 0.3s ease',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box display="flex" alignItems="center" gap={1.5}>
              <Avatar
                sx={{
                  bgcolor: 'white',
                  color: '#667eea',
                  width: 40,
                  height: 40,
                }}
              >
                <BotIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" color="white" fontWeight="bold">
                  Assistant IA
                </Typography>
                <Typography variant="caption" color="rgba(255, 255, 255, 0.8)">
                  En ligne
                </Typography>
              </Box>
            </Box>
            <Box>
              <IconButton size="small" onClick={handleMinimize} sx={{ color: 'white' }}>
                <MinimizeIcon />
              </IconButton>
              <IconButton size="small" onClick={handleClose} sx={{ color: 'white' }}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Chat Content */}
          <Collapse in={!minimized}>
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                p: 2,
                bgcolor: 'white',
                maxHeight: 390,
              }}
            >
              {messages.map((message, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                    mb: 2,
                  }}
                >
                  <Paper
                    elevation={1}
                    sx={{
                      p: 1.5,
                      maxWidth: '80%',
                      bgcolor: message.role === 'user' ? '#667eea' : '#f5f5f5',
                      color: message.role === 'user' ? 'white' : 'text.primary',
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {message.content}
                    </Typography>
                  </Paper>
                </Box>
              ))}

              {loading && (
                <Box display="flex" justifyContent="flex-start" mb={2}>
                  <Paper elevation={1} sx={{ p: 1.5, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                    <CircularProgress size={20} />
                  </Paper>
                </Box>
              )}

              {/* Suggested Questions */}
              {messages.length === 1 && !loading && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Questions suggérées:
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                    {suggestedQuestions.map((question, index) => (
                      <Chip
                        key={index}
                        label={question}
                        size="small"
                        onClick={() => handleSuggestedQuestion(question)}
                        sx={{
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: '#667eea',
                            color: 'white',
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              <div ref={messagesEndRef} />
            </Box>

            {/* Input Area */}
            <Box
              sx={{
                p: 2,
                borderTop: '1px solid #e0e0e0',
                bgcolor: 'white',
              }}
            >
              <Box display="flex" gap={1}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Posez votre question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                  multiline
                  maxRows={3}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
                <IconButton
                  color="primary"
                  onClick={handleSendMessage}
                  disabled={!input.trim() || loading}
                  sx={{
                    bgcolor: '#667eea',
                    color: 'white',
                    '&:hover': {
                      bgcolor: '#764ba2',
                    },
                    '&.Mui-disabled': {
                      bgcolor: '#e0e0e0',
                    },
                  }}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </Box>
          </Collapse>
        </Paper>
      </Zoom>

      {/* Floating Action Button */}
      <Zoom in={!open}>
        <Fab
          color="primary"
          onClick={handleToggleChat}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1300,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
            },
          }}
        >
          <BotIcon />
        </Fab>
      </Zoom>
    </>
  );
};

export default AIChatbot;
