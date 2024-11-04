


/*
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
      {/* Title *
      <DialogTitle sx={{ fontSize: '1.25rem', marginTop: '20px' }}>
        Request Download for {documentName}
      </DialogTitle>

      {/* Form content *
      <DialogContent>
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Full Name *
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

          {/* Email *
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

          {/* Company Name *
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

          {/* Reason *
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

      {/* Dialog actions *
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
*/



import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  TextField, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  MenuItem 
} from '@mui/material';
import { requestDocumentDownload } from '../api/fetchTrustRessources'; // Fonction de téléchargement du document
import { db } from '../auth/firebase'; // Import de l'instance Firestore
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; // Fonctions Firestore

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
  const [isEmailValid, setIsEmailValid] = useState(true); // État pour la validation de l'email
  const [emailTouched, setEmailTouched] = useState(false); // État pour savoir si l'email a été touché
  const [isSubmitting, setIsSubmitting] = useState(false); // État pour le processus de soumission

  // Fonction de validation de l'email avec regex
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Pattern regex basique
    return emailRegex.test(email);
  };

  // Validation des champs du formulaire
  useEffect(() => {
    const emailIsValid = validateEmail(email);
    setIsEmailValid(emailIsValid || !emailTouched); // Afficher l'erreur uniquement si le champ a été touché
    const isValid = fullName.trim() !== '' && email.trim() !== '' && companyName.trim() !== '' && reason.trim() !== '' && emailIsValid;
    setIsFormValid(isValid);
  }, [fullName, email, companyName, reason, emailTouched]);

  // Gestion de la logique de téléchargement et d'enregistrement
  const handleDownload = async () => {
    if (isFormValid) {
      setIsSubmitting(true); // Indique que la soumission est en cours
      try {
        // Demander le téléchargement du document
        await requestDocumentDownload({
          fullName,
          email,
          companyName,
          reason,
          documentName,
        });

        // Enregistrer les informations dans Firestore
        const trustInfoCollection = collection(db, 'trustInfo');
        await addDoc(trustInfoCollection, {
          fullName: fullName.trim(),
          email: email.trim(),
          companyName: companyName.trim(),
          reason: reason.trim(),
          documentName,
          requestedAt: serverTimestamp(), // Ajouter un timestamp
        });

        onClose(); // Fermer la modal après le téléchargement réussi
      } catch (error) {
        console.error('Erreur lors du téléchargement ou de l\'enregistrement des informations :', error);
        // Vous pouvez également afficher une notification ou un message d'erreur à l'utilisateur ici
      } finally {
        setIsSubmitting(false); // Réinitialiser l'état de soumission
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      {/* Titre */}
      <DialogTitle sx={{ fontSize: '1.25rem', marginTop: '20px' }}>
        Request Download for {documentName}
      </DialogTitle>

      {/* Contenu du formulaire */}
      <DialogContent>
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Nom complet */}
          <Box>
            <Typography variant="subtitle2" sx={{ marginBottom: '8px' }}>Full Name</Typography>
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
              error={!isEmailValid && emailTouched} // Afficher l'erreur si l'email est invalide et a été touché
              helperText={!isEmailValid && emailTouched ? 'Please enter a valid email address' : ''}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)} // Marquer comme touché lorsque l'utilisateur quitte le champ
              InputProps={{ sx: { height: '40px', borderRadius: '8px' } }}
            />
          </Box>

          {/* Nom de l'université */}
          <Box>
            <Typography variant="subtitle2" sx={{ marginBottom: '8px' }}>University Name</Typography>
            <TextField
              variant="outlined"
              fullWidth
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              InputProps={{ sx: { height: '40px', borderRadius: '8px' } }}
            />
          </Box>

          {/* Raison */}
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

      {/* Actions du Dialog */}
      <DialogActions sx={{ padding: '16px' }}>
        <Button onClick={onClose} variant="outlined" disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handleDownload}
          variant="contained"
          color="primary"
          disabled={!isFormValid || isSubmitting} // Désactiver si le formulaire est invalide ou en cours de soumission
          sx={{
            backgroundColor: (!isFormValid || isSubmitting) ? 'gray' : 'primary.main',
            color: 'white',
            '&:hover': { backgroundColor: (!isFormValid || isSubmitting) ? 'gray' : 'primary.dark' },
          }}
        >
          {isSubmitting ? 'Processing...' : 'Download'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentDownloadModal;