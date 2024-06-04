//MODIFICATION DE L'INTERFACE AVEC LE NOM DISPLAY EN DESSOUS DU CONTAINER ET PLUS DANS LE CONTAINER POUR LAISSER TOUTE L'IMAGE. 


//FONCTION UNIQUEMENT À L'UPLOAD LE NOUVEAU DESIGN
import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  ThemeProvider, Button, Menu, MenuItem, Snackbar, Box, Typography, Grid,
  Card, CardContent, IconButton, Divider, LinearProgress, ListItemIcon, ListItemText
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FeedbackIcon from '@mui/icons-material/Feedback';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import LogoutIcon from '@mui/icons-material/Logout';
import ShareIcon from '@mui/icons-material/Share';
import DeleteIcon from '@mui/icons-material/Delete';
import { useParams, useNavigate } from 'react-router-dom';
import logo_prof from '../teacher_face.png';
import '../index.css';
import { useAuth } from '../auth/hooks/useAuth';
import { doc, getDoc } from "firebase/firestore";
import { db } from '../auth/firebase';

type FilterOption = 'Very Socratic' | 'Socratic flexible answer' | 'No socratic answer';

const filterStyles: Record<FilterOption, { backgroundColor: string; color: string }> = {
  'Very Socratic': {
    backgroundColor: '#DDFCE5',
    color: '#43AE58',
  },
  'Socratic flexible answer': {
    backgroundColor: '#FFD4CB',
    color: '#E64626',
  },
  'No socratic answer': {
    backgroundColor: '#FCE2E1',
    color: '#F04261',
  },
};

const Dashboard_teacher_template: React.FC = () => {
  const theme = useTheme();
  const { uid, course_id } = useParams<{ uid: string; course_id: string }>();
  const navigate = useNavigate();
  const [courseName, setCourseName] = useState<string | null>(null);
  const [publishedFiles, setPublishedFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourseName = async () => {
      try {
        if (!course_id) {
          setCourseName('Invalid Course ID');
          return;
        }

        console.log(`Fetching course with course_id: ${course_id}`);
        const courseRef = doc(db, 'courses', course_id);
        const courseSnap = await getDoc(courseRef);

        if (courseSnap.exists()) {
          const courseData = courseSnap.data();
          console.log('Course data:', courseData);
          setCourseName(courseData.name);
        } else {
          console.log('No such course document!');
          setCourseName('Course Not Found');
        }
      } catch (error) {
        console.error('Error fetching course name:', error);
        setCourseName('Error fetching course name');
      }
    };

    fetchCourseName();
  }, [course_id]);

  useEffect(() => {
    const fetchPublishedFiles = async () => {
      try {
        const response = await fetch(`http://localhost:8005/file/fetching/${course_id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const result = await response.json();
          const files = result.files || [];
          setPublishedFiles(files);
        } else {
          console.error('Failed to fetch published files');
          setPublishedFiles([]);
        }
      } catch (error) {
        console.error('Error fetching published files:', error);
        setPublishedFiles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublishedFiles();
  }, [course_id]);

  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [socraticAnchorEl, setSocraticAnchorEl] = useState<null | HTMLElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [socraticityLevel, setSocraticityLevel] = useState<FilterOption>('Very Socratic');
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('Very Socratic');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showDeleteIcons, setShowDeleteIcons] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const filePreviews = useRef<{ [key: string]: string }>({});

  const { logout } = useAuth();

  const handleSocraticMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setSocraticAnchorEl(event.currentTarget);
  };

  const handleSocraticMenuClose = (option: FilterOption) => {
    setSocraticAnchorEl(null);
    setSocraticityLevel(option);
  };

  const handleSocraticMenuCloseWithoutSelection = () => {
    setSocraticAnchorEl(null);
  };

  const handleDropDownClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (option: FilterOption) => {
    setAnchorEl(null);
    setSelectedFilter(option);
  };

  const handleMenuCloseWithoutSelection = () => {
    setAnchorEl(null);
  };

  const handleMoreMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMoreMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleDeleteAllClick = () => {
    setShowDeleteIcons(true);
    setMenuAnchorEl(null);
  };

  const handleFileDelete = (index: number) => {
    setUploadedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0 && uid && course_id) {
      const file = files[0];
      setIsUploading(true);

      try {
        const apiResponse = await sendFileToBackend(file, uid, course_id);
        console.log("API response received:", apiResponse);
        setPublishedFiles((prevFiles) => [...prevFiles, apiResponse]);  // Add new file details to published files
        setSnackbarMessage(`The file ${file.name} has been processed successfully`);
        setSnackbarOpen(true);
      } catch (error) {
        console.error("Error processing file:", error);
        setSnackbarMessage(`Error processing file: ${file.name}`);
        setSnackbarOpen(true);
      } finally {
        setIsUploading(false);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } else {
      setSnackbarMessage('User ID or Course ID is missing');
      setSnackbarOpen(true);
    }
  };

  const sendFileToBackend = async (file: File, uid: string, course_id: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('uid', uid);
    formData.append('course_id', course_id);

    const pineconeIndexName = localStorage.getItem('pinecone_index_name');
    if (pineconeIndexName) { 
        formData.append('pinecone_index_name', pineconeIndexName);
    } else {
        console.error('pinecone_index_name not found in localStorage');
        throw new Error('pinecone_index_name is required but not found in localStorage');
    }

    const urlParts = new URL(window.location.href);
    const subDomain = urlParts.hostname.split('.')[0];
    const bucketName = `${subDomain}-bucket`;
    formData.append('bucket_name', bucketName);

    console.log('Sending formData:', Array.from(formData.entries())); // Log form data for debugging

    const response = await fetch('http://localhost:8005/file/upload_file_from_teacher_dashboard', {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        const errorText = await response.text(); // Capture response text for debugging
        console.error('Failed to upload file:', errorText);
        throw new Error(`Failed to upload file: ${errorText}`);
    }

    return response.json();
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const generatePreviewUrl = (file: File) => {
    if (filePreviews.current[file.name]) {
      return filePreviews.current[file.name];
    }
    const url = URL.createObjectURL(file);
    filePreviews.current[file.name] = url;
    return url;
  };

  const renderFilePreview = (file: File) => {
    const previewUrl = generatePreviewUrl(file);
    if (file.type === 'application/pdf') {
      return (
        <object data={previewUrl} type="application/pdf" width="100%" height="140">
          <p>PDF preview is not available.</p>
        </object>
      );
    } else if (file.type.startsWith('video/')) {
      return (
        <video width="100%" height="140" controls>
          <source src={previewUrl} type={file.type} />
          Your browser does not support the video tag.
        </video>
      );
    }
    return null;
  };

  const handleProfileMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/sign-in');
  };

  const graphUrl = 'http://localhost:8003/static/cluster_plot.html';

  const handleShareLinkClick = () => {
    if (course_id) {
      const currentUrl = window.location.href;
      const urlParts = new URL(currentUrl);
      const subDomain = urlParts.hostname.split('.')[0];
      const domain = urlParts.hostname.split('.').slice(1).join('.');
      const port = urlParts.port ? `:${urlParts.port}` : '';
      const link = `${urlParts.protocol}//${subDomain}.${domain}${port}/auth/sign-up/${course_id}`;

      navigator.clipboard.writeText(link)
        .then(() => {
          setSnackbarMessage('Link copied');
          setSnackbarOpen(true);
        })
        .catch((error) => {
          console.error('Failed to copy link:', error);
          setSnackbarMessage('Failed to copy link');
          setSnackbarOpen(true);
        });
    }
    setMenuAnchorEl(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="flex flex-col h-screen" style={{ backgroundColor: theme.palette.background.default }}>
        <div className="relative p-4 bg-white flex items-center justify-between border-b border-gray-100">
          <div onClick={handleDropDownClick} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', backgroundColor: filterStyles[selectedFilter].backgroundColor, padding: '4px 8px', borderRadius: '8px' }}>
            <Typography sx={{ fontWeight: '500', fontSize: '0.875rem', color: filterStyles[selectedFilter].color, marginRight: '8px' }}>{selectedFilter}</Typography>
            <ArrowDropDownIcon sx={{ fontSize: '1rem', color: filterStyles[selectedFilter].color }} />
          </div>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuCloseWithoutSelection}
            PaperProps={{ style: { borderRadius: '12px' } }}
          >
            {selectedFilter !== 'Very Socratic' && (
              <MenuItem onClick={() => handleMenuClose('Very Socratic')}>
                <Typography style={{ fontWeight: '500', fontSize: '0.875rem', color: '#43AE58', backgroundColor: '#DDFCE5', padding: '4px 8px', borderRadius: '8px' }}>Very Socratic</Typography>
              </MenuItem>
            )}
            {selectedFilter !== 'Socratic flexible answer' && (
              <MenuItem onClick={() => handleMenuClose('Socratic flexible answer')}>
                <Typography style={{ fontWeight: '500', fontSize: '0.875rem', color: '#E64626', backgroundColor: '#FFD4CB', padding: '4px 8px', borderRadius: '8px' }}>Socratic flexible answer</Typography>
              </MenuItem>
            )}
            {selectedFilter !== 'No socratic answer' && (
              <MenuItem onClick={() => handleMenuClose('No socratic answer')}>
                <Typography style={{ fontWeight: '500', fontSize: '0.875rem', color: '#F04261', backgroundColor: '#FCE2E1', padding: '4px 8px', borderRadius: '8px' }}>No socratic answer</Typography>
              </MenuItem>
            )}
          </Menu>
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <h1 className="text-2xl font-bold text-custom-blue">
              {courseName || 'Dashboard'}
            </h1>
          </div>
          <div style={{ flexGrow: 1 }}></div>

          <img src={logo_prof} alt="Profile" className="w-10 h-10 mr-4" style={{ cursor: 'pointer' }} onClick={handleProfileMenuClick} />
          <Menu
            anchorEl={profileAnchorEl}
            open={Boolean(profileAnchorEl)}
            onClose={handleProfileMenuClose}
            PaperProps={{ style: { borderRadius: '12px' } }}
          >
            <MenuItem onClick={handleLogout} style={{ fontWeight: '500', fontSize: '0.875rem', color: theme.palette.error.main }}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" style={{ color: theme.palette.error.main }} />
              </ListItemIcon>
              <ListItemText primary="Log Out" />
            </MenuItem>
          </Menu>

          <Button
            variant="contained"
            startIcon={<FeedbackIcon />}
            style={{ backgroundColor: theme.palette.primary.main, color: '#ffffff', marginLeft: '0px' }}
          >
            Feedback
          </Button>
        </div>
        <Grid container spacing={2} style={{ padding: '20px' }}>
          <Grid item xs={12} md={5} style={{ marginLeft: '20px' }}>
            <Typography variant="h6" gutterBottom>
              Upload Section
            </Typography>
            <Box display="flex" flexDirection="column" alignItems="flex-start" mb={4}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                style={{
                  textTransform: 'none',
                  backgroundColor: isUploading ? '#FFD4CB' : theme.palette.primary.main, // Using specified color when uploading
                  color: '#ffffff',
                }}
                component="label"
                disabled={isUploading}
              >
                Publish a new file
                <input type="file" hidden accept=".pdf, .mp4" onChange={handleFileUpload} ref={fileInputRef} />
              </Button>
              {isUploading && (
                <LinearProgress
                  sx={{
                    width: '100%',
                    marginTop: '10px',
                    backgroundColor: theme.palette.action.disabledBackground,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: theme.palette.primary.main,
                      borderRadius: '15px',
                    },
                    borderRadius: '15px',
                  }}
                />
              )}
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" gutterBottom>
                Published Files
              </Typography>
              <div>
                {showDeleteIcons && (
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={() => setShowDeleteIcons(false)}
                    style={{
                      backgroundColor: theme.palette.primary.main,
                      color: '#ffffff',
                      marginRight: '10px',
                      textTransform: 'none',
                    }}
                  >
                    Done
                  </Button>
                )}
                <IconButton onClick={handleMoreMenuClick}>
                  <MoreVertIcon />
                </IconButton>
                <Menu anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={handleMoreMenuClose} PaperProps={{ style: { borderRadius: '12px' } }}>
                  <MenuItem onClick={handleShareLinkClick} style={{ fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.primary }}>
                    <ListItemIcon>
                      <ShareIcon fontSize="small" style={{ color: theme.palette.text.primary }} />
                    </ListItemIcon>
                    Share link to students
                  </MenuItem>
                  <MenuItem onClick={handleDeleteAllClick} style={{ fontWeight: '500', fontSize: '0.875rem', color: theme.palette.error.main }}>
                    <ListItemIcon>
                      <DeleteIcon fontSize="small" style={{ color: theme.palette.error.main }} />
                    </ListItemIcon>
                    Delete
                  </MenuItem>
                </Menu>
              </div>
            </Box>
            {isLoading ? (
              <Typography variant="body2" style={{ fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.secondary }}>
                Loading files...
              </Typography>
            ) : publishedFiles.length === 0 ? (
              <Typography variant="body2" style={{ fontWeight: '500', fontSize: '0.875rem', color: theme.palette.text.secondary }}>
                You haven't published any documents yet
              </Typography>
            ) : (
              <Grid container spacing={3} style={{ marginBottom: '16px' }}>
                {publishedFiles.map((file, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card style={{ height: '220px', width: 'auto', position: 'relative' }}>
                      {showDeleteIcons && (
                        <IconButton
                          style={{ position: 'absolute', top: '5px', right: '5px', backgroundColor: 'rgba(255, 255, 255, 0.7)' }}
                          size="small"
                          onClick={() => handleFileDelete(index)}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      )}
                      <CardContent style={{ padding: 0 }}>
                        <img src={file.preview_url} alt={file.file_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </CardContent>
                    </Card>
                    <Typography
                      variant="body2"
                      component="p"
                      style={{
                        fontWeight: '500',
                        fontSize: '0.75rem',
                        marginTop: '4px',
                        textAlign: 'center',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {file.file_name}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
          <Divider orientation="vertical" flexItem style={{ backgroundColor: '#e0e0e0', margin: '0 20px' }} />
          <Grid item xs={12} md={6} style={{ minHeight: '100vh' }}>
            <Typography variant="h6" gutterBottom>
              Analytics
            </Typography>
            <Box>
              {graphUrl ? (
                <iframe src={graphUrl} width="100%" height="600px" />
              ) : (
                <Typography variant="body2" color="textSecondary">
                  Loading graph...
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </div>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        ContentProps={{
          sx: {
            backgroundColor: '#DDFCE5',
            color: '#43AE58', // Setting text color to #43AE58
            borderRadius: '15px',
          },
        }}
      />
    </ThemeProvider>
  );
};

export default Dashboard_teacher_template;
