import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, TextField, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem } from '@mui/material';
import { requestDocumentDownload } from '../api/fetchTrustRessources'; // Import the document download function

interface DocumentDownloadModalProps {
  open: boolean;
  onClose: () => void;
  documentName: string;
}

const DocumentDownloadModal: React.FC<DocumentDownloadModalProps> = ({ open, onClose, documentName }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [reason, setReason] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true); // State to track email validation
  const [emailTouched, setEmailTouched] = useState(false); // State to track if email input has been touched

  // Email validation function using regex
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;  // Basic email regex pattern
    return emailRegex.test(email);
  };

  // Validate form fields
  useEffect(() => {
    const emailIsValid = validateEmail(email);
    setIsEmailValid(emailIsValid || !emailTouched); // Only show email validation error if the field has been touched
    const isValid = fullName !== '' && email !== '' && companyName !== '' && reason !== '' && emailIsValid;
    setIsFormValid(isValid);
  }, [fullName, email, companyName, reason, emailTouched]);

  // Handle the download logic
  const handleDownload = async () => {
    if (isFormValid) {
      try {
        await requestDocumentDownload({
          fullName,
          email,
          companyName,
          reason,
          documentName,
        });
        onClose(); // Close the modal after successful download
      } catch (error) {
        console.error('Error while downloading the document:', error);
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      {/* Title */}
      <DialogTitle sx={{ fontSize: '1.25rem', marginTop: '20px' }}>
        Request Download for {documentName}
      </DialogTitle>

      {/* Form content */}
      <DialogContent>
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Full Name */}
          <Box>
            <Typography variant="subtitle2" sx={{ marginBottom: '8px' }}>Full name</Typography>
            <TextField
              variant="outlined"
              fullWidth
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              InputProps={{ sx: { height: '40px', borderRadius: '8px' } }}
            />
          </Box>

          {/* Email */}
          <Box>
            <Typography variant="subtitle2" sx={{ marginBottom: '8px' }}>Email</Typography>
            <TextField
              variant="outlined"
              fullWidth
              required
              error={!isEmailValid && emailTouched}  // Show error if email is invalid and has been touched
              helperText={!isEmailValid && emailTouched ? 'Please enter a valid email address' : ''}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)} // Set email as touched when the user leaves the field
              InputProps={{ sx: { height: '40px', borderRadius: '8px' } }}
            />
          </Box>

          {/* Company Name */}
          <Box>
            <Typography variant="subtitle2" sx={{ marginBottom: '8px' }}>University name</Typography>
            <TextField
              variant="outlined"
              fullWidth
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              InputProps={{ sx: { height: '40px', borderRadius: '8px' } }}
            />
          </Box>

          {/* Reason */}
          <Box>
            <Typography variant="subtitle2" sx={{ marginBottom: '8px' }}>Reason</Typography>
            <TextField
              variant="outlined"
              select
              fullWidth
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              InputProps={{ sx: { height: '40px', borderRadius: '8px' } }}
            >
              <MenuItem value="I'm an existing customer">I'm an existing customer</MenuItem>
              <MenuItem value="I'm a prospective customer">I'm a prospective customer</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>
          </Box>
        </Box>
      </DialogContent>

      {/* Dialog actions */}
      <DialogActions sx={{ padding: '16px' }}>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button
          onClick={handleDownload}
          variant="contained"
          color="primary"
          disabled={!isFormValid}  // Disable the button if the form is invalid
          sx={{
            backgroundColor: !isFormValid ? 'gray' : 'primary',
            color: 'white',
            '&:hover': { backgroundColor: !isFormValid ? 'gray' : 'primary.main' },
          }}
        >
          Download
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentDownloadModal;