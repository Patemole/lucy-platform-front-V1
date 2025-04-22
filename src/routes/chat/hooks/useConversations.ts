import { useState } from 'react';
import useAuthStore from '../../../stores/useAuthStore';
import useChatStore from '../../../stores/useChatStore';
import { format, isToday, isYesterday } from 'date-fns';
import { Conversation, SocialThread /*, Message */ } from '../../../interfaces/interfaces_eleve';
import { Timestamp } from 'firebase/firestore';

export const useConversations = () => {
  // const { user /* , setPrimaryChatId */ } = useAuthStore(); // LIGNE SUPPRIMÉE
  const {
    conversations,
    socialThreads,
    addNewConversation,
    renameConversation,
    deleteConversation,
    updateConversationPrivacy,
    setActiveChat,
  } = useChatStore();
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedConversationIdForMenu, setSelectedConversationIdForMenu] = useState<string | null>(null);

  const formatDate = (timestampInput: any): string => {
    if (!timestampInput) {
      return 'Date inconnue';
    }
    let date: Date | null = null;
    if (timestampInput instanceof Timestamp) {
      date = timestampInput.toDate();
    } else if (typeof timestampInput === 'string' || typeof timestampInput === 'number') {
      try {
        date = new Date(timestampInput);
        if (isNaN(date.getTime())) date = null;
      } catch (e) { date = null; }
    } else if (timestampInput instanceof Date && !isNaN(timestampInput.getTime())) {
      date = timestampInput;
    }
    if (!date) return 'Date invalide';
    if (isToday(date)) return `Today, ${format(date, 'HH:mm')}`;
    if (isYesterday(date)) return `Yesterday, ${format(date, 'HH:mm')}`;
    return `${format(date, 'dd/MM/yyyy')}, ${format(date, 'HH:mm')}`;
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, chatId: string) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedConversationIdForMenu(chatId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedConversationIdForMenu(null);
  };

  const handleConversationClick = (chat_id: string) => {
    console.log('useConversations: handleConversationClick triggered for', chat_id);
    if (!chat_id) {
      console.error('handleConversationClick: Chat ID invalide');
      return;
    }
    if (chat_id === useChatStore.getState().currentChatId) {
      console.log(`handleConversationClick: Chat ${chat_id} is already active.`);
      return;
    }
    setActiveChat(chat_id);
  };

  const handleNewConversationClick = async () => {
    console.log('useConversations: handleNewConversationClick -> calling addNewConversation action');
    await addNewConversation();
  };

  const handleRenameClick = async () => {
    if (!selectedConversationIdForMenu) return;
    const currentConv = conversations.find(c => c.chat_id === selectedConversationIdForMenu)
                     || socialThreads.find(t => t.chat_id === selectedConversationIdForMenu);
    const currentName = currentConv?.name || '';
    const newName = prompt('Enter new name:', currentName);
    if (newName?.trim() && newName.trim() !== currentName) {
      console.log(`useConversations: handleRenameClick -> calling renameConversation action for ${selectedConversationIdForMenu}`);
      await renameConversation(selectedConversationIdForMenu, newName.trim());
    }
    handleMenuClose();
  };

  const handleDeleteClick = async () => {
    if (!selectedConversationIdForMenu) return;
    const confirmDelete = window.confirm("Are you sure you want to delete this conversation?");
    if (confirmDelete) {
      console.log(`useConversations: handleDeleteClick -> calling deleteConversation action for ${selectedConversationIdForMenu}`);
      await deleteConversation(selectedConversationIdForMenu);
    }
    handleMenuClose();
  };

  const handlePrivacyToggleClick = async () => {
    if (!selectedConversationIdForMenu) return;
    const currentConv = conversations.find(c => c.chat_id === selectedConversationIdForMenu);
    const isCurrentlyPrivate = currentConv?.thread_type === 'Private';
    console.log(`useConversations: handlePrivacyToggleClick -> calling updateConversationPrivacy for ${selectedConversationIdForMenu}. Setting to: ${!isCurrentlyPrivate ? 'Private' : 'Public'}`);
    await updateConversationPrivacy(selectedConversationIdForMenu, !isCurrentlyPrivate);
    handleMenuClose();
  };

  return {
    formatDate,
    menuAnchorEl,
    selectedConversationIdForMenu,
    handleMenuOpen,
    handleMenuClose,
    handleNewConversationClick,
    handleConversationClick,
    handleRenameClick,
    handleDeleteClick,
    handlePrivacyToggleClick,
  };
};



