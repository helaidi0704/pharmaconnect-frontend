import React from 'react';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  Paper,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Update as UpdateIcon,
  CheckCircle as CheckIcon,
  Message as MessageIcon,
  AttachFile as FileIcon,
  Cancel as CancelIcon,
  HourglassEmpty as PendingIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ClaimTimeline = ({ claim, messages = [], files = [] }) => {
  // Combine all events into a timeline
  const events = [];

  // Add claim creation
  events.push({
    type: 'created',
    date: claim.createdAt,
    title: 'Réclamation créée',
    description: `${claim.claimType} - Priorité: ${claim.priority}`,
    icon: <AddIcon />,
    color: 'primary',
  });

  // Add status history
  if (claim.statusHistory && claim.statusHistory.length > 0) {
    claim.statusHistory.forEach((history) => {
      let icon, color, title;

      switch (history.status) {
        case 'in_progress':
          icon = <UpdateIcon />;
          color = 'info';
          title = 'En cours de traitement';
          break;
        case 'pending':
          icon = <PendingIcon />;
          color = 'warning';
          title = 'En attente';
          break;
        case 'resolved':
          icon = <CheckIcon />;
          color = 'success';
          title = 'Résolu';
          break;
        case 'rejected':
          icon = <CancelIcon />;
          color = 'error';
          title = 'Rejeté';
          break;
        case 'closed':
          icon = <CloseIcon />;
          color = 'grey';
          title = 'Fermé';
          break;
        default:
          icon = <UpdateIcon />;
          color = 'grey';
          title = 'Mise à jour';
      }

      events.push({
        type: 'status',
        date: history.changedAt,
        title,
        description: history.notes || '',
        icon,
        color,
      });
    });
  }

  // Add messages
  if (messages && messages.length > 0) {
    messages.forEach((message) => {
      events.push({
        type: 'message',
        date: message.createdAt,
        title: 'Message',
        description: message.message.substring(0, 100) + (message.message.length > 100 ? '...' : ''),
        sender: message.senderId?.companyName || 'Utilisateur',
        icon: <MessageIcon />,
        color: 'secondary',
      });
    });
  }

  // Add file uploads
  if (files && files.length > 0) {
    files.forEach((file) => {
      events.push({
        type: 'file',
        date: file.createdAt,
        title: 'Fichier ajouté',
        description: file.originalName,
        icon: <FileIcon />,
        color: 'grey',
      });
    });
  }

  // Sort events by date (most recent first)
  events.sort((a, b) => new Date(b.date) - new Date(a.date));

  const getStatusLabel = (status) => {
    const labels = {
      created: 'Créé',
      in_progress: 'En cours',
      pending: 'En attente',
      resolved: 'Résolu',
      rejected: 'Rejeté',
      closed: 'Fermé',
    };
    return labels[status] || status;
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6">Chronologie de la réclamation</Typography>
        <Chip
          label={getStatusLabel(claim.status)}
          color={
            claim.status === 'resolved' ? 'success' :
            claim.status === 'rejected' ? 'error' :
            claim.status === 'in_progress' ? 'info' :
            claim.status === 'pending' ? 'warning' :
            claim.status === 'closed' ? 'default' :
            'primary'
          }
          size="small"
        />
      </Box>

      <Timeline position="right">
        {events.map((event, index) => (
          <TimelineItem key={index}>
            <TimelineOppositeContent
              sx={{ flex: 0.3 }}
              color="text.secondary"
              variant="body2"
            >
              {format(new Date(event.date), 'dd MMM yyyy', { locale: fr })}
              <br />
              <Typography variant="caption">
                {format(new Date(event.date), 'HH:mm', { locale: fr })}
              </Typography>
            </TimelineOppositeContent>

            <TimelineSeparator>
              <TimelineDot color={event.color} variant={index === 0 ? 'filled' : 'outlined'}>
                {event.icon}
              </TimelineDot>
              {index < events.length - 1 && <TimelineConnector />}
            </TimelineSeparator>

            <TimelineContent>
              <Paper
                elevation={index === 0 ? 3 : 1}
                sx={{
                  p: 2,
                  backgroundColor: index === 0 ? 'action.hover' : 'background.paper',
                }}
              >
                <Typography variant="subtitle1" fontWeight={index === 0 ? 'bold' : 'medium'}>
                  {event.title}
                </Typography>
                {event.sender && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    Par: {event.sender}
                  </Typography>
                )}
                {event.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {event.description}
                  </Typography>
                )}
              </Paper>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Paper>
  );
};

export default ClaimTimeline;
