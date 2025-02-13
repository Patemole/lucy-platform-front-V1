import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';
import config from '../config';
import { 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { db } from '../auth/firebase';

interface ConversationMessage {
  role: string;
  content: string;
}

interface ChatSession {
  chat_id: string;
  name: string;
  topic: string;
  thread_type: string;
  created_at: string;
  modified_at: string;
  ReadBy?: string[];
}

interface AuthInfo {
  email: string;
  email_verified: boolean;
  phone_number?: string;
  provider_id: string;
  photo_url?: string;
  created_at: string;
  last_login: string;
}

interface UserData {
  uid: string;
  year: string;
  chatsessions?: string[];
  interests?: string[];
  faculty?: string[];
  profile_picture?: string;
  minor?: string[];
  updatedAt: string;
  university: string;
  name: string;
  registered_clubs?: string;
  academic_advisor?: string;
  major?: string[];
  role: string;
  registered_club_status: string;
  createdAt: string;
  email: string;
  chat_sessions?: ChatSession[];
  auth_info?: AuthInfo;
  conversations?: {
    [key: string]: ConversationMessage[];
  };
}

const UserAnalytics = () => {
  const [searchType, setSearchType] = useState<'uid' | 'name'>('uid');
  const [uid, setUid] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, logout, chatIds, setPrimaryChatId } = useAuth();

  const apiUrlPrefix: string = config.server_url;

  // function to get uid by name from firebase with logs
  const getUidByName = async (name: string): Promise<string | null> => {
    console.log('Searching for user with name:', name);
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('name', '==', name));
    const querySnapshot = await getDocs(q);
    console.log('Query snapshot size:', querySnapshot.size);
    if (querySnapshot.empty) {
      console.warn('No user found with name:', name);
      return null;
    }
    const docData = querySnapshot.docs[0].data();
    console.log('User found:', querySnapshot.docs[0].id, docData);
    // assume document id is the uid
    return querySnapshot.docs[0].id;
  };

  const fetchUserData = async () => {
    if (!uid) return;
    setLoading(true);
    setError(null);
    setUserData(null);

    let searchUid = uid;

    if (searchType === 'name') {
      console.log('Search type is "name", resolving uid for name:', uid);
      const resolvedUid = await getUidByName(uid);
      if (!resolvedUid) {
        setError('user not found by name');
        console.error('Resolved uid is null for name:', uid);
        setLoading(false);
        return;
      }
      console.log('Resolved uid:', resolvedUid);
      searchUid = resolvedUid;
    }


    
    try {
      const response = await fetch(`${apiUrlPrefix}/analytics/user_analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uid: searchUid })
      });
      if (!response.ok) {
        const errData = await response.json();
        setError(errData.detail || 'an error occurred');
        setLoading(false);
        return;
      }
      const data = await response.json();
      setUserData(data);
    } catch (err) {
      setError('error fetching data');
    }
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      fetchUserData();
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>user analytics</h1>
      <div style={{ marginBottom: '20px' }}>
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value as 'uid' | 'name')}
          style={{ padding: '10px', marginRight: '10px' }}
        >
          <option value="uid">uid</option>
          <option value="name">name</option>
        </select>
        <input
          type="text"
          placeholder="enter a user uid or name"
          value={uid}
          onChange={(e) => setUid(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{ padding: '10px', width: '300px' }}
        />
        <button
          onClick={fetchUserData}
          style={{ marginLeft: '10px', padding: '10px' }}
        >
          send
        </button>
      </div>
      {loading && <p>loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {userData && (
        <div style={{ marginTop: '20px' }}>
          <h2>user information</h2>
          <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '5px' }}>
            <p><strong>uid:</strong> {userData.uid}</p>
            <p><strong>year:</strong> {userData.year}</p>
            <p>
              <strong>chat sessions:</strong>{' '}
              {userData.chatsessions ? userData.chatsessions.join(', ') : 'not defined'}
            </p>
            <p>
              <strong>interests:</strong>{' '}
              {userData.interests ? userData.interests.join(', ') : 'not defined'}
            </p>
            <p>
              <strong>faculty:</strong>{' '}
              {userData.faculty ? userData.faculty.join(', ') : 'not defined'}
            </p>
            <p>
              <strong>profile picture:</strong>{' '}
              {userData.profile_picture || 'not defined'}
            </p>
            <p>
              <strong>minor:</strong>{' '}
              {userData.minor ? userData.minor.join(', ') : 'not defined'}
            </p>
            <p><strong>updated at:</strong> {userData.updatedAt}</p>
            <p><strong>university:</strong> {userData.university}</p>
            <p><strong>name:</strong> {userData.name}</p>
            <p>
              <strong>registered clubs:</strong>{' '}
              {userData.registered_clubs || 'not defined'}
            </p>
            <p>
              <strong>academic advisor:</strong>{' '}
              {userData.academic_advisor || 'not defined'}
            </p>
            <p>
              <strong>major:</strong>{' '}
              {userData.major ? userData.major.join(', ') : 'not defined'}
            </p>
            <p><strong>role:</strong> {userData.role}</p>
            <p>
              <strong>registered club status:</strong>{' '}
              {userData.registered_club_status}
            </p>
            <p><strong>created at:</strong> {userData.createdAt}</p>
            <p><strong>email:</strong> {userData.email}</p>
          </div>

          {userData.chat_sessions && userData.chat_sessions.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h3>chat sessions</h3>
              {userData.chat_sessions.map((chat, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: '10px',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '5px',
                    backgroundColor: '#fafafa'
                  }}
                >
                  <p><strong>chat_id:</strong> {chat.chat_id}</p>
                  <p><strong>name:</strong> {chat.name}</p>
                  <p><strong>topic:</strong> {chat.topic}</p>
                  <p><strong>thread type:</strong> {chat.thread_type}</p>
                  <p><strong>created at:</strong> {chat.created_at}</p>
                  <p><strong>modified at:</strong> {chat.modified_at}</p>
                  <p>
                    <strong>readBy:</strong>{' '}
                    {chat.ReadBy ? chat.ReadBy.join(', ') : 'not defined'}
                  </p>
                </div>
              ))}
            </div>
          )}

          {userData.auth_info && (
            <div style={{ marginTop: '20px' }}>
              <h3>authentication info</h3>
              <p><strong>email:</strong> {userData.auth_info.email}</p>
              <p>
                <strong>email verified:</strong>{' '}
                {userData.auth_info.email_verified ? 'true' : 'false'}
              </p>
              <p>
                <strong>phone number:</strong>{' '}
                {userData.auth_info.phone_number || 'not defined'}
              </p>
              <p>
                <strong>provider id:</strong> {userData.auth_info.provider_id}
              </p>
              <p>
                <strong>photo_url:</strong>{' '}
                {userData.auth_info.photo_url || 'not defined'}
              </p>
              <p><strong>created at:</strong> {userData.auth_info.created_at}</p>
              <p>
                <strong>last login:</strong> {userData.auth_info.last_login}
              </p>
            </div>
          )}

          {Object.keys(userData.conversations ?? {}).length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h3>conversations</h3>
              {Object.keys(userData.conversations ?? {}).map((convId) => (
                <div
                  key={convId}
                  style={{
                    marginBottom: '20px',
                    padding: '15px',
                    background: '#e8f5e9',
                    borderRadius: '5px',
                    border: '1px solid #c8e6c9'
                  }}
                >
                  <h4>conversation id: {convId}</h4>
                  {userData.conversations?.[convId].map((msg, idx) => (
                    <div
                      key={idx}
                      style={{
                        marginBottom: '10px',
                        padding: '10px',
                        background: msg.role === 'user' ? '#e3f2fd' : '#fff9c4',
                        borderRadius: '5px'
                      }}
                    >
                      <p>
                        <strong>{msg.role}:</strong> {msg.content}
                      </p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserAnalytics;
