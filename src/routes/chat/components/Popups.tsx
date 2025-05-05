import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import PopupWrongAnswer from '../../../components/main_components/Popup/PopupWrongAnswer';
import PopupEventSoonAvailable from '../../../components/main_components/Popup/PopupEventSoonAvailable';
import PopupOnboardingSocialThread from '../../../components/main_components/Popup/Popup_Onboarding_SocialThread';
import PopupOnboardingProfile from '../../../components/main_components/Popup/Popup_Onboarding_Profile';
import PopupOnboardingModifyConv from '../../../components/main_components/Popup/Popup_Onboarding_ModifyConv';
import StudentProfileDialog from '../../../components/main_components/Popup/StudentProfileDialog';
import EventDetailsSidebar from '../../../components/main_components/EventDetailsSidebar';

import { EventStudentProfile } from '../../../interfaces/interfaces_eleve';


interface PopupsContainerProps {
    modalOpen: boolean;
    onCloseWrongAnswer: () => void;
    onSubmitWrongAnswer: (
        feedback: string,
        aiMessageContent: string | null,
        humanMessageContent: string | null,
        ratings: {
          relevance?: number;
          accuracy?: number;
          format?: number;
          sources?: number;
          overall_satisfaction?: number;
        }
      ) => Promise<void>; // corriger ici la signature
    aiMessageContent: string | null;
    humanMessageContent: string | null;
    dialogOpen: boolean;
    onCloseDialog: () => void;
    selectedEvent: EventStudentProfile | null;
    sidebarOpen: boolean;
    onCloseSidebar: () => void;
    openModal: boolean;
    closeModal: () => void;
    showOnboardingSocialThreadPopup: boolean;
    closeOnboardingSocialThread: () => void;
    showOnboardingProfilePopup: boolean;
    closeOnboardingProfile: () => void;
    showOnboardingModifyConvPopup: boolean;
    closeOnboardingModifyConv: () => void;
    snackbarOpen: boolean;
    snackbarMessage: string;
    closeSnackbar: () => void;
    setProfilePicture: (val: string | null) => void;
    userUniversity?: string;
  }



  const PopupsContainer: React.FC<PopupsContainerProps> = ({
    modalOpen,
    onCloseWrongAnswer,
    onSubmitWrongAnswer,
    aiMessageContent,
    humanMessageContent,
    dialogOpen,
    onCloseDialog,
    setProfilePicture,
    selectedEvent,
    sidebarOpen,
    onCloseSidebar,
    openModal,
    closeModal,
    showOnboardingSocialThreadPopup,
    closeOnboardingSocialThread,
    showOnboardingProfilePopup,
    closeOnboardingProfile,
    showOnboardingModifyConvPopup,
    closeOnboardingModifyConv,
    snackbarOpen,
    snackbarMessage,
    closeSnackbar,
    userUniversity,
  }) => {
    console.log('<<< RENDERING PopupsContainer >>>');
    return (
      <>
        <PopupWrongAnswer
          open={modalOpen}
          onClose={onCloseWrongAnswer}
          onSubmit={onSubmitWrongAnswer}
          aiMessageContent={aiMessageContent}
          humanMessageContent={humanMessageContent}
          userUniversity={userUniversity}
        />
  
        <StudentProfileDialog open={dialogOpen} onClose={onCloseDialog} setProfilePicture={setProfilePicture} userUniversity={userUniversity} />
  
        <EventDetailsSidebar event={selectedEvent} open={sidebarOpen} onClose={onCloseSidebar} />
  
        {openModal && <PopupEventSoonAvailable onClose={closeModal} />}
  
        {showOnboardingSocialThreadPopup && (
          <PopupOnboardingSocialThread onClose={closeOnboardingSocialThread} />
        )}
        {showOnboardingProfilePopup && (
          <PopupOnboardingProfile onClose={closeOnboardingProfile} />
        )}
        {showOnboardingModifyConvPopup && (
          <PopupOnboardingModifyConv onClose={closeOnboardingModifyConv} />
        )}
  
        <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={closeSnackbar}>
          <Alert onClose={closeSnackbar} severity="info" sx={{ width: '100%', fontWeight: '500', fontSize: '0.875rem' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </>
    );
  };
  
  export default PopupsContainer;


