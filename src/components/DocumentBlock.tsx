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
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
// import DocumentDownloadModal from './PopupTrustDownloadRessource'; // Import du nouveau composant

interface DocumentBlockProps {
  documents: string[];
}

const DocumentBlock: React.FC<DocumentBlockProps> = ({ documents }) => {
  // const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  // const [modalOpen, setModalOpen] = useState(false);

  // const handleOpenModal = (document: string) => {
  //   setSelectedDocument(document);
  //   setModalOpen(true);
  // };

  // const handleCloseModal = () => {
  //   setModalOpen(false);
  //   setSelectedDocument(null);
  // };

  const handleDownload = (documentName: string) => {
    // Appel au backend pour télécharger le document à partir du bucket S3
    console.log(`Téléchargement du document: ${documentName}`);
    // Vous pouvez ici utiliser fetch ou axios pour faire un appel API
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
              // onClick={() => handleOpenModal(document)} // Ouvre la popup au clic (commentée)
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
                <LockOutlinedIcon sx={{ color: '#9e9e9e' }} /> {/* Icône de cadenas plus fine */}
              </ListItemIcon>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Modal pour demander le téléchargement */}
      {/* 
      {selectedDocument && (
        <DocumentDownloadModal
          open={modalOpen}
          onClose={handleCloseModal}
          documentName={selectedDocument}
        />
      )}
      */}
    </Box>
  );
};

export default DocumentBlock;