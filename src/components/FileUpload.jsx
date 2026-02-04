import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import { filesAPI } from '../services/api';
import { useSnackbar } from 'notistack';

const FileUpload = ({ claimId }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (claimId) {
      fetchFiles();
    }
  }, [claimId]);

  const fetchFiles = async () => {
    if (!claimId) return;
    
    setLoading(true);
    try {
      const response = await filesAPI.getByClaimId(claimId);
      setFiles(response.data.data);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validation de la taille (5 Mo max)
    if (file.size > 5 * 1024 * 1024) {
      enqueueSnackbar('Le fichier est trop volumineux (max 5 Mo)', { variant: 'error' });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (claimId) {
        formData.append('claimId', claimId);
      }

      await filesAPI.upload(formData);
      enqueueSnackbar('Fichier envoyé avec succès', { variant: 'success' });
      fetchFiles();
    } catch (error) {
      console.error('Error uploading file:', error);
      enqueueSnackbar(
        error.response?.data?.error?.message || 'Erreur lors de l\'envoi',
        { variant: 'error' }
      );
    } finally {
      setUploading(false);
      event.target.value = null; // Reset input
    }
  };

  const handleDelete = async (fileId) => {
    try {
      await filesAPI.delete(fileId);
      enqueueSnackbar('Fichier supprimé', { variant: 'success' });
      fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      enqueueSnackbar('Erreur lors de la suppression', { variant: 'error' });
    }
  };

  const handleView = (fileId) => {
    window.open(`http://localhost:8082/api/files/${fileId}`, '_blank');
  };

  const getFileIcon = (mimetype) => {
    if (mimetype.startsWith('image/')) {
      return <ImageIcon color="primary" />;
    } else if (mimetype === 'application/pdf') {
      return <PdfIcon color="error" />;
    } else {
      return <FileIcon />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Fichiers joints</Typography>
        <Button
          variant="contained"
          component="label"
          startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <UploadIcon />}
          disabled={uploading}
        >
          {uploading ? 'Envoi...' : 'Ajouter un fichier'}
          <input
            type="file"
            hidden
            onChange={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx"
          />
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 2 }}>
        Formats acceptés : Images (JPEG, PNG, GIF), PDF, DOC, DOCX (max 5 Mo)
      </Alert>

      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : files.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
          Aucun fichier joint
        </Typography>
      ) : (
        <List>
          {files.map((file) => (
            <ListItem
              key={file._id}
              button
              onClick={() => handleView(file._id)}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                mb: 1,
              }}
            >
              <Box sx={{ mr: 2 }}>{getFileIcon(file.mimetype)}</Box>
              <ListItemText
                primary={file.originalName}
                secondary={`${formatFileSize(file.size)} • ${new Date(
                  file.createdAt
                ).toLocaleDateString('fr-FR')}`}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(file._id);
                  }}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default FileUpload;
