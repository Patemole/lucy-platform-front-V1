import React from 'react';
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText, Link } from '@mui/material';

// Copié depuis WeeklyFocus.tsx - Idéalement, ce type pourrait être dans un fichier partagé
interface UsefulLink {
    text: string;
    linkText: string;
    description: string;
}

interface UsefulLinksSectionProps {
    usefulLinks: UsefulLink[];
}

const UsefulLinksSection: React.FC<UsefulLinksSectionProps> = ({ usefulLinks }) => {
    // Si pas de liens, ne rien afficher
    if (!usefulLinks || usefulLinks.length === 0) {
        return null;
    }

    return (
        <Box sx={{ width: '100%', maxWidth: 480, mb: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Useful links</Typography>
            <List dense sx={{ p: 0 }}>
                {usefulLinks.map((link, index) => (
                    <ListItem key={index} sx={{ p: 0, alignItems: 'baseline' }}>
                        <ListItemIcon sx={{ minWidth: 'auto', mt: '4px', mr: 1 }}>
                            <Box sx={{ width: 4, height: 4, bgcolor: 'primary.main', borderRadius: '50%' }} />
                        </ListItemIcon>
                        <ListItemText>
                            <Typography component="span" sx={{ fontWeight: 'bold' }}>{link.text} </Typography>
                            <Link href="#" underline="hover">{link.linkText}</Link>
                            <Typography component="span" sx={{ color: 'text.secondary' }}> {link.description}</Typography>
                        </ListItemText>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default UsefulLinksSection; 