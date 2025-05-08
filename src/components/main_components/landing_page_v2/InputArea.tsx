import React, { useState } from 'react';
import { Box, TextField, IconButton, Typography, InputAdornment, Tooltip } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import PublicIcon from '@mui/icons-material/Public';
import LockIcon from '@mui/icons-material/Lock';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface InputAreaProps {
    onSend: (message: string) => void;
    handlePrivacyChange: (isPublic: boolean) => void;
    value: string;
    onChangeValue: (value: string) => void;
}

const InputArea: React.FC<InputAreaProps> = ({ onSend, handlePrivacyChange, value, onChangeValue }) => {
    const [isPublic, setIsPublic] = useState(true);

    const handleSelectPrivacy = (publicSelected: boolean) => {
        setIsPublic(publicSelected);
        handlePrivacyChange(publicSelected);
    };

    const handleSend = () => {
        if (value.trim()) {
            onSend(value);
        }
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    };

    return (
        <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            px: 2,
            py: { xs: 1, sm: 2 },
            backgroundColor: 'transparent', 
            position: 'relative' 
        }}>
            <Box sx={{ width: '100%', maxWidth: '800px' }}> 
                <TextField
                    fullWidth
                    variant="outlined"
                    multiline
                    minRows={1}
                    maxRows={6}
                    placeholder="Ask this week about Housing and Dining selection..."
                    value={value}
                    onChange={(e) => onChangeValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start" sx={{ mr: '8px' }}>
                                <Tooltip title={isPublic ? "Make conversation Private" : "Make conversation Public"} enterDelay={100} arrow>
                                    <Box
                                        onClick={() => handleSelectPrivacy(!isPublic)}
                                        sx={{
                                            fontSize: '0.8rem',
                                            fontWeight: 'bold',
                                            color: isPublic ? '#4A90E2' : '#6F6F6F',
                                            backgroundColor: isPublic ? '#E0F2FF' : '#F0F0F0',
                                            padding: '4px 10px',
                                            borderRadius: '5px',
                                            display: 'inline-block',
                                            cursor: 'pointer',
                                            userSelect: 'none'
                                        }}
                                    >
                                        {isPublic ? 'Public' : 'Private'}
                                    </Box>
                                </Tooltip>
                            </InputAdornment>
                        ),
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    color="primary"
                                    onClick={handleSend}
                                    disabled={!value.trim()}
                                    edge="end"
                                >
                                    <Box
                                        sx={{
                                            backgroundColor: '#011F5B',
                                            borderRadius: '50%',
                                            width: '30px',
                                            height: '30px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            '&:hover': {
                                                backgroundColor: '#001644',
                                            },
                                        }}
                                    >
                                        <ArrowForwardIcon
                                            style={{
                                                color: '#fff',
                                                fontSize: '20px',
                                            }}
                                        />
                                    </Box>
                                </IconButton>
                            </InputAdornment>
                        ),
                        style: {
                            backgroundColor: '#F4F4F4',
                            fontSize: '1rem',
                            padding: '17px 8px',
                            borderRadius: '20px',
                            fontWeight: '500',
                            color: '#333',
                            paddingRight: '14px',
                            paddingLeft: '14px',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                            border: 'none',
                        },
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            padding: '0px',
                            '& fieldset': { border: 'none' },
                            '&:hover fieldset': {
                                border: 'none',
                            },
                            '&.Mui-focused fieldset': { border: 'none' }
                        },
                        '& .MuiInputBase-input::placeholder': {
                            color: '#6F6F6F',
                            opacity: 1,
                        },
                        '& .MuiInputBase-inputMultiline': {
                            paddingTop: '0px',
                            paddingBottom: '0px'
                        }
                    }}
                />
            </Box>
            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: 'text.secondary', mt: 1 }}>
                Lucy can make mistake. Consider checking important informations
            </Typography>
        </Box>
    );
};

export default InputArea; 