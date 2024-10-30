// PopupWidgetManager.tsx
import React from 'react';
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Checkbox,
  FormControlLabel,
  Button,
  Backdrop,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';

interface PopupWidgetManagerProps {
  open: boolean;
  onClose: () => void;
  widgets: { id: string; name: string }[];
  visibleWidgets: { [key: string]: boolean };
  onToggleWidget: (id: string) => void;
  onSave: () => void;
}

const PopupWidgetManager: React.FC<PopupWidgetManagerProps> = ({
  open,
  onClose,
  widgets,
  visibleWidgets,
  onToggleWidget,
  onSave,
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
        style: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: isSmallScreen ? '5%' : '50%',
          left: '50%',
          transform: isSmallScreen ? 'translate(-50%, 0)' : 'translate(-50%, -50%)',
          width: isSmallScreen ? '90vw' : 600,
          maxHeight: isSmallScreen ? '90vh' : 'auto',
          overflowY: 'auto',
          bgcolor: theme.palette.background.paper,
          boxShadow: 24,
          p: 4,
          borderRadius: '12px',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h5" component="h2" sx={{ color: theme.palette.text.primary }}>
            Manage Widgets
          </Typography>
          <IconButton onClick={onClose} sx={{ color: theme.palette.text.primary }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Typography sx={{ fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary }}>
          Select which widgets to display on the dashboard:
        </Typography>

        <Box sx={{ mt: 2 }}>
          {widgets.map((widget) => (
            <FormControlLabel
              key={widget.id}
              control={
                <Checkbox
                  checked={!!visibleWidgets[widget.id]}
                  onChange={() => onToggleWidget(widget.id)} // Mise à jour dynamique
                  color="primary"
                />
              }
              label={widget.name}
              sx={{ color: theme.palette.text.primary }}
            />
          ))}
        </Box>

        <Button
          onClick={() => {
            onSave(); // Enregistrer les modifications
            onClose(); // Fermer la popup
          }}
          sx={{
            mt: 2,
            backgroundColor: theme.palette.button_sign_in,
            color: theme.palette.button_text_sign_in,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
          }}
          variant="contained"
          fullWidth={isSmallScreen}
        >
          Save Changes
        </Button>
      </Box>
    </Modal>
  );
};

export default PopupWidgetManager;