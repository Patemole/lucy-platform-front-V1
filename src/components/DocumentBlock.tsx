// components/DocumentBlock.tsx

/*
import React, { useState } from 'react';
import { Box, Typography, List, ListItem, ListItemIcon } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import DocumentDownloadModal from './PopupTrustDownloadRessource'; // Import du nouveau composant

interface DocumentBlockProps {
  documents: string[];
}

const DocumentBlock: React.FC<DocumentBlockProps> = ({ documents }) => {
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = (document: string) => {
    setSelectedDocument(document);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedDocument(null);
  };

  const handleDownload = (documentName: string) => {
    // Appel au backend pour télécharger le document à partir du bucket S3
    console.log(`Téléchargement du document: ${documentName}`);
    // Vous pouvez ici utiliser fetch ou axios pour faire un appel API
  };

  return (
    <Box>
      {/* Bloc de documents *
      <Box sx={{ border: '1px solid #E0E0E0', borderRadius: '8px', padding: '16px' }}>
        <List disablePadding>
          {documents.map((document, index) => (
            <ListItem
              key={index}
              sx={{
                paddingLeft: '0px',
                paddingRight: '0px',
                display: 'flex',
                justifyContent: 'space-between',
                cursor: 'pointer', // Ajout du curseur sur tout l'élément
                '&:hover': { backgroundColor: '#f5f5f5' },
              }}
              onClick={() => handleOpenModal(document)} // Ouvre la popup au clic
            >
              <Typography
                variant="body1"
                sx={{
                  color: '#7C3BEC',
                  '&:hover': { textDecoration: 'underline' }, // Maintient le soulignement au survol
                }}
              >
                {document}
              </Typography>
              <ListItemIcon sx={{ minWidth: 'auto' }}>
                <LockOutlinedIcon sx={{ color: '#9e9e9e' }} /> {/* Icône de cadenas plus fine *
              </ListItemIcon>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Modal pour demander le téléchargement *
      {selectedDocument && (
        <DocumentDownloadModal
          open={modalOpen}
          onClose={handleCloseModal}
          documentName={selectedDocument}
        />
      )}
    </Box>
  );
};

export default DocumentBlock;
*/


// components/DocumentBlock.tsx
import React, { useState } from 'react';
import { Box, Typography, List, ListItem, ListItemIcon } from '@mui/material';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import DocumentDownloadModal from './PopupTrustDownloadRessource'; // Import du nouveau composant
import { requestDocumentDownload } from '../api/fetchTrustRessources'; // Assuming this is your download function

interface DocumentBlockProps {
  documents: string[];
}

const DocumentBlock: React.FC<DocumentBlockProps> = ({ documents }) => {
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = (document: string) => {
     setSelectedDocument(document);
     setModalOpen(true);
   };

   const handleCloseModal = () => {
     setModalOpen(false);
     setSelectedDocument(null);
   };

   const handleDownload = (documentName: string) => {
    // Directly trigger the download without opening a modal
    requestDocumentDownload({
      fullName: "User Full Name", // Replace or dynamically retrieve user info as needed
      email: "user@example.com",   // Replace or dynamically retrieve user info as needed
      companyName: "User Company", // Replace or dynamically retrieve user info as needed
      reason: "Download Reason",   // Replace or dynamically retrieve user info as needed
      documentName,
    });
  };

  return (
    <Box>
      {/* Bloc de documents */}
      <Box sx={{ border: '1px solid #E0E0E0', borderRadius: '8px', padding: '16px' }}>
        <List disablePadding>
          {documents.map((document, index) => (
            <ListItem
              key={index}
              sx={{
                paddingLeft: '0px',
                paddingRight: '0px',
                display: 'flex',
                justifyContent: 'space-between',
                cursor: 'pointer', // Ajout du curseur sur tout l'élément
                '&:hover': { backgroundColor: '#f5f5f5' },
              }}
               //onClick={() => handleOpenModal(document)} // Ouvre la popup au clic (commentée)
               onClick={() => handleDownload(document)} // Directly triggers the download
            >
              <Typography
                variant="body1"
                sx={{
                  color: '#7C3BEC',
                  '&:hover': { textDecoration: 'underline' }, // Maintient le soulignement au survol
                }}
              >
                {document}
              </Typography>
              <ListItemIcon sx={{ minWidth: 'auto' }}>
                <LockOpenOutlinedIcon sx={{ color: '#9e9e9e' }} /> {/* Icône de cadenas plus fine */}
              </ListItemIcon>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Modal pour demander le téléchargement */}
      {selectedDocument && (
        <DocumentDownloadModal
          open={modalOpen}
          onClose={handleCloseModal}
          documentName={selectedDocument}
        />
      )}
    </Box>
  );
};

export default DocumentBlock;