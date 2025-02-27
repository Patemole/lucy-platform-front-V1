import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import config from '../../config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../auth/firebase';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

// Interfaces de données
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
  conversations?: { [key: string]: ConversationMessage[] };
}

interface UniversityUserCount {
  university: string;
  user_count: number;
}

interface ConversationStatistics {
  total_conversations: number;
  privacy_distribution: {
    Private: number;
    Public: number;
    "No info": number;
  };
  topic_distribution: {
    Event: number;
    Policies: number;
    Chitchat: number;
    Courses: number;
    "Financial Aids": number;
    "No info": number;
  };
  name_distribution: {
    "New Chat": number;
    "Autre titre": number;
  };
}

interface UserStatistics {
  total_users: number;
  university_distribution: { [key: string]: number };
  year_distribution: { [key: string]: number };
  chat_sessions_stats: {
    average: number;
    max: number;
    min: number;
  };
  registered_club_status_distribution: { [key: string]: number };
}

interface ActiveUsersMetrics {
  dau: number;
  wau: number;
  mau: number;
  sau: number;
  returning_users: number;
  churn_rate: number;
  avg_sessions_per_user: number;
  rolling_retention_14_days: number;
}

const COLORS = ['#0088fe', '#00c49f', '#ffbb28', '#ff8042', '#aa336a', '#66aa00'];

// Pour l'endpoint active users, on définit un modèle de requête
interface ActiveUsersRequest {
  since_date?: string; // Format "YYYY-MM-DD". Si absent, la date du jour est utilisée.
}

const UserAnalytics = () => {
  // États pour la recherche et l'affichage
  const [searchType, setSearchType] = useState<'uid' | 'name' | 'university'>('uid');
  const [uid, setUid] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>('');
  
  const [userData, setUserData] = useState<UserData | null>(null);
  const [universityData, setUniversityData] = useState<UniversityUserCount | null>(null);
  const [conversationStats, setConversationStats] = useState<ConversationStatistics | null>(null);
  const [userStats, setUserStats] = useState<UserStatistics | null>(null);
  const [activeUsersStats, setActiveUsersStats] = useState<ActiveUsersMetrics | null>(null);

  // États pour les dates de filtrage
  const [sinceDate, setSinceDate] = useState('');           // Pour Conversation Statistics
  const [userSinceDate, setUserSinceDate] = useState('');     // Pour User Statistics
  const [activeUsersSinceDate, setActiveUsersSinceDate] = useState(''); // Pour Active Users Metrics

  const theme = useTheme();
  const navigate = useNavigate();
  const { user, logout, chatIds, setPrimaryChatId } = useAuth();
  const apiUrlPrefix: string = config.server_url;

  // Fonction pour récupérer le UID par nom depuis Firestore
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
    return querySnapshot.docs[0].id;
  };

  // Fonction de récupération des données utilisateur ou du compte universitaire
  const fetchUserData = async () => {
    if (!uid) return;
    setLoading(true);
    setError(null);
    setUserData(null);
    setUniversityData(null);
    // Réinitialiser les autres états
    setConversationStats(null);
    setUserStats(null);
    setActiveUsersStats(null);

    if (searchType === 'university') {
      console.log('Search type "university", fetching university user count for:', uid);
      try {
        const response = await fetch(`${apiUrlPrefix}/analytics/university_user_count`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ university: uid })
        });
        if (!response.ok) {
          const errData = await response.json();
          setError(errData.detail || 'An error occurred');
          setLoading(false);
          return;
        }
        const data = await response.json();
        console.log('University data retrieved:', data);
        setUniversityData(data);
      } catch (err) {
        setError('Error fetching university data');
      }
      setLoading(false);
      return;
    }

    let searchUid = uid;
    if (searchType === 'name') {
      console.log('Search type "name", resolving UID for name:', uid);
      const resolvedUid = await getUidByName(uid);
      if (!resolvedUid) {
        setError('User not found by name');
        console.error('Resolved UID is null for name:', uid);
        setLoading(false);
        return;
      }
      console.log('Resolved UID:', resolvedUid);
      searchUid = resolvedUid;
    }

    try {
      const response = await fetch(`${apiUrlPrefix}/analytics/user_analytics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: searchUid })
      });
      if (!response.ok) {
        const errData = await response.json();
        setError(errData.detail || 'An error occurred');
        setLoading(false);
        return;
      }
      const data = await response.json();
      setUserData(data);
    } catch (err) {
      setError('Error fetching user data');
    }
    setLoading(false);
  };

  // Récupération des statistiques de conversation
  const fetchConversationStats = async () => {
    if (!sinceDate) {
      setError('Please select a date before fetching conversation statistics');
      return;
    }
    setLoading(true);
    setError(null);
    setConversationStats(null);
    try {
      const response = await fetch(`${apiUrlPrefix}/analytics/conversation_statistics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ since_date: sinceDate })
      });
      if (!response.ok) {
        const errData = await response.json();
        setError(errData.detail || 'An error occurred');
        setLoading(false);
        return;
      }
      const data = await response.json();
      console.log('Conversation statistics retrieved:', data);
      setConversationStats(data);
    } catch (err) {
      setError('Error fetching conversation statistics');
    }
    setLoading(false);
  };

  // Récupération des statistiques utilisateur
  const fetchUserStats = async () => {
    if (!userSinceDate) {
      setError('Please select a date before fetching user statistics');
      return;
    }
    setLoading(true);
    setError(null);
    setUserStats(null);
    try {
      const response = await fetch(`${apiUrlPrefix}/analytics/user_statistics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ since_date: userSinceDate })
      });
      if (!response.ok) {
        const errData = await response.json();
        setError(errData.detail || 'An error occurred');
        setLoading(false);
        return;
      }
      const data = await response.json();
      console.log('User statistics retrieved:', data);
      setUserStats(data);
    } catch (err) {
      setError('Error fetching user statistics');
    }
    setLoading(false);
  };

  // Récupération des métriques d'Active Users stricts
  const fetchActiveUsers = async () => {
    if (!activeUsersSinceDate) {
      setError('Please select a date before fetching active users metrics');
      return;
    }
    setLoading(true);
    setError(null);
    setActiveUsersStats(null);
    try {
      const response = await fetch(`${apiUrlPrefix}/analytics/active_users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ since_date: activeUsersSinceDate })
      });
      if (!response.ok) {
        const errData = await response.json();
        setError(errData.detail || 'An error occurred');
        setLoading(false);
        return;
      }
      const data = await response.json();
      console.log('Active users metrics retrieved:', data);
      setActiveUsersStats(data);
    } catch (err) {
      setError('Error fetching active users metrics');
    }
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      fetchUserData();
    }
  };

  // Préparation des données pour les graphiques de statistiques de conversation
  const privacyData = conversationStats
    ? Object.entries(conversationStats.privacy_distribution).map(([key, value]) => ({
        name: key,
        value: value,
      }))
    : [];
  const topicData = conversationStats
    ? Object.entries(conversationStats.topic_distribution).map(([key, value]) => ({
        name: key,
        value: value,
      }))
    : [];
  const nameData = conversationStats
    ? Object.entries(conversationStats.name_distribution).map(([key, value]) => ({
        name: key,
        value: value,
      }))
    : [];

  // Préparation des données pour les graphiques de statistiques utilisateur
  const universityChartData = userStats
    ? Object.entries(userStats.university_distribution).map(([key, value]) => ({
        name: key,
        value: value,
      }))
    : [];
  const yearChartData = userStats
    ? Object.entries(userStats.year_distribution).map(([key, value]) => ({
        name: key,
        value: value,
      }))
    : [];
  const clubStatusChartData = userStats
    ? Object.entries(userStats.registered_club_status_distribution).map(([key, value]) => ({
        name: key,
        value: value,
      }))
    : [];

  return (
    <div style={{ padding: '20px' }}>
      <h1>User Analytics Dashboard</h1>
      
      {/* --- Section de Recherche Utilisateur (UID, Name, University) --- */}
      <div style={{ marginBottom: '20px' }}>
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value as 'uid' | 'name' | 'university')}
          style={{ padding: '10px', marginRight: '10px' }}
        >
          <option value="uid">UID</option>
          <option value="name">Name</option>
          <option value="university">University</option>
        </select>
        <input
          type="text"
          placeholder="Enter a user UID, name, or university"
          value={uid}
          onChange={(e) => setUid(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{ padding: '10px', width: '300px', marginRight: '10px' }}
        />
        <button onClick={fetchUserData} style={{ padding: '10px', marginLeft: '10px' }}>
          Fetch User Data
        </button>
      </div>

      {/* --- Affichage des Informations Utilisateur --- */}
      {userData && (
        <div style={{ marginTop: '20px' }}>
          <h2>User Information</h2>
          <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '5px' }}>
            <p><strong>UID:</strong> {userData.uid}</p>
            <p><strong>Name:</strong> {userData.name}</p>
            <p><strong>Year:</strong> {userData.year}</p>
            <p><strong>University:</strong> {userData.university}</p>
            <p><strong>Email:</strong> {userData.email}</p>
            {/* Autres champs d'information peuvent être ajoutés ici */}
          </div>
        </div>
      )}


    {userData && (
            <div style={{ marginTop: '20px' }}>
                <h3>Academic Information</h3>
                <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '5px' }}>
                <p><strong>Faculty:</strong> {userData.faculty?.length ? userData.faculty.join(', ') : 'N/A'}</p>
                <p><strong>Major:</strong> {userData.major?.length ? userData.major.join(', ') : 'N/A'}</p>
                <p><strong>Minor:</strong> {userData.minor?.length ? userData.minor.join(', ') : 'N/A'}</p>
                <p><strong>Academic Advisor:</strong> {userData.academic_advisor ?? 'N/A'}</p>
                <p><strong>Registered Club Status:</strong> {userData.registered_club_status === 'yes' ? '✅ Yes' : '❌ No'}</p>
                <p><strong>Registered Clubs:</strong> {userData.registered_clubs ?? 'None'}</p>
                </div>
            </div>
            )}


    {userData?.auth_info && (
    <div style={{ marginTop: '20px' }}>
        <h3>Authentication Info</h3>
        <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '5px' }}>
        <p><strong>Email:</strong> {userData.auth_info.email}</p>
        <p><strong>Email Verified:</strong> {userData.auth_info.email_verified ? '✅ Yes' : '❌ No'}</p>
        <p><strong>Phone Number:</strong> {userData.auth_info.phone_number || 'N/A'}</p>
        <p><strong>Provider:</strong> {userData.auth_info.provider_id}</p>
        <p><strong>Account Created:</strong> {userData.auth_info.created_at}</p>
        <p><strong>Last Login:</strong> {userData.auth_info.last_login}</p>
        </div>
    </div>
    )}


    {userData?.profile_picture && (
    <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <h3>Profile Picture</h3>
        <img
        src={userData.profile_picture}
        alt="Profile"
        style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover' }}
        />
    </div>
    )}

    {userData?.auth_info?.photo_url && (
    <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <h3>Auth Provider Picture</h3>
        <img
        src={userData.auth_info.photo_url}
        alt="Auth Profile"
        style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover' }}
        />
    </div>
    )}


    {userData?.interests && userData.interests.length > 0 && (
        <div style={{ marginTop: '20px' }}>
            <h3>Interests</h3>
            <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '5px' }}>
            {userData.interests.map((interest, index) => (
                <span
                key={index}
                style={{
                    display: 'inline-block',
                    background: '#0088fe',
                    color: '#fff',
                    padding: '5px 10px',
                    borderRadius: '15px',
                    margin: '5px',
                }}
                >
                {interest}
                </span>
            ))}
            </div>
        </div>
        )}



    {userData?.chat_sessions && userData.chat_sessions.length > 0 && (
        <div style={{ marginTop: '20px' }}>
            <h3>Chat Sessions</h3>
            {userData.chat_sessions.map((chat, index) => (
            <div
                key={index}
                style={{
                marginBottom: '10px',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '5px',
                backgroundColor: '#fafafa',
                }}
            >
                <p><strong>Chat Name:</strong> {chat.name}</p>
                <p><strong>Topic:</strong> {chat.topic}</p>
                <p><strong>Thread Type:</strong> {chat.thread_type}</p>
                <p><strong>Created At:</strong> {chat.created_at}</p>
                <p><strong>Modified At:</strong> {chat.modified_at}</p>
                <p>
                <strong>Read By:</strong>{' '}
                {chat.ReadBy && chat.ReadBy.length > 0 ? chat.ReadBy.join(', ') : 'No one'}
                </p>
            </div>
            ))}
        </div>
        )}
    


      {/* --- Affichage des Conversations --- */}
      {userData?.conversations && Object.keys(userData.conversations || {}).length > 0 ? (
        <div style={{ marginTop: '20px' }}>
            <h3>Conversations</h3>
            {Object.keys(userData.conversations || {}).map((convId) => (
            <div
                key={convId}
                style={{
                marginBottom: '20px',
                padding: '15px',
                background: '#e8f5e9',
                borderRadius: '5px',
                border: '1px solid #c8e6c9',
                }}
            >
                <h4>Conversation ID: {convId}</h4>
                {userData.conversations?.[convId] && userData.conversations[convId].length > 0 ? (
                userData.conversations[convId].map((msg, idx) => (
                    <div
                    key={idx}
                    style={{
                        marginBottom: '10px',
                        padding: '10px',
                        background: msg.role === 'user' ? '#e3f2fd' : '#fff9c4',
                        borderRadius: '5px',
                    }}
                    >
                    <p><strong>{msg.role}:</strong> {msg.content}</p>
                    </div>
                ))
                ) : (
                <p style={{ fontStyle: 'italic', color: '#888' }}>No messages available.</p>
                )}
            </div>
            ))}
        </div>
        ) : (
        <p style={{ fontStyle: 'italic', color: '#888' }}>No conversations available.</p>
        )}



      {/* --- Section Conversation Statistics --- */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="date"
          value={sinceDate}
          onChange={(e) => setSinceDate(e.target.value)}
          style={{ padding: '10px', marginRight: '10px' }}
        />
        <button onClick={fetchConversationStats} style={{ padding: '10px' }}>
          Conversation Statistics
        </button>
      </div>
      {conversationStats && (
        <div style={{ marginTop: '40px' }}>
          <h2>Conversation Statistics (since {sinceDate})</h2>
          <div style={{ background: '#f0f0f0', padding: '20px', borderRadius: '5px' }}>
            <h3 style={{ fontSize: '2em' }}>
              Total Conversations: {conversationStats.total_conversations}
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
              <div style={{ margin: '20px' }}>
                <h3>Privacy Distribution</h3>
                <p style={{ fontStyle: 'italic' }}>Based on conversations since {sinceDate}</p>
                <PieChart width={300} height={300}>
                  <Pie data={privacyData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                    {privacyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </div>
              <div style={{ margin: '20px' }}>
                <h3>Topic Distribution</h3>
                <p style={{ fontStyle: 'italic' }}>Based on conversations since {sinceDate}</p>
                <PieChart width={300} height={300}>
                  <Pie data={topicData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#82ca9d" label>
                    {topicData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </div>
              <div style={{ margin: '20px' }}>
                <h3>Name Distribution</h3>
                <p style={{ fontStyle: 'italic' }}>Based on conversations since {sinceDate}</p>
                <PieChart width={300} height={300}>
                  <Pie data={nameData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#ffc658" label>
                    {nameData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Section User Statistics --- */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="date"
          value={userSinceDate}
          onChange={(e) => setUserSinceDate(e.target.value)}
          style={{ padding: '10px', marginRight: '10px' }}
        />
        <button onClick={fetchUserStats} style={{ padding: '10px' }}>
          User Statistics
        </button>
      </div>
      {userStats && (
        <div style={{ marginTop: '40px' }}>
          <h2>User Statistics (since {userSinceDate})</h2>
          <div style={{ background: '#e0f7fa', padding: '20px', borderRadius: '5px' }}>
            <h3 style={{ fontSize: '2em' }}>Total Users: {userStats.total_users}</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around' }}>
              <div style={{ margin: '20px' }}>
                <h3>University Distribution</h3>
                <p style={{ fontStyle: 'italic' }}>Based on user data since {userSinceDate}</p>
                <PieChart width={300} height={300}>
                  <Pie data={universityChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#0088fe" label>
                    {universityChartData.map((entry, index) => (
                      <Cell key={`uni-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </div>
              <div style={{ margin: '20px' }}>
                <h3>Year Distribution</h3>
                <p style={{ fontStyle: 'italic' }}>Based on user data since {userSinceDate}</p>
                <PieChart width={300} height={300}>
                  <Pie data={yearChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#00c49f" label>
                    {yearChartData.map((entry, index) => (
                      <Cell key={`year-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </div>
              <div style={{ margin: '20px' }}>
                <h3>Club Status Distribution</h3>
                <p style={{ fontStyle: 'italic' }}>Based on user data since {userSinceDate}</p>
                <PieChart width={300} height={300}>
                  <Pie data={clubStatusChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#ff8042" label>
                    {clubStatusChartData.map((entry, index) => (
                      <Cell key={`club-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </div>
            </div>
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <h3>Chat Sessions Stats</h3>
              <p style={{ fontStyle: 'italic' }}>Calculated based on user data since {userSinceDate}</p>
              <p><strong>Average:</strong> {userStats.chat_sessions_stats.average}</p>
              <p><strong>Max:</strong> {userStats.chat_sessions_stats.max}</p>
              <p><strong>Min:</strong> {userStats.chat_sessions_stats.min}</p>
            </div>
          </div>
        </div>
      )}

      {/* --- Section Active Users Metrics --- */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="date"
          value={activeUsersSinceDate}
          onChange={(e) => setActiveUsersSinceDate(e.target.value)}
          style={{ padding: '10px', marginRight: '10px' }}
        />
        <button onClick={fetchActiveUsers} style={{ padding: '10px' }}>
          Active Users Metrics
        </button>
      </div>
      {activeUsersStats && (
        <div style={{ marginTop: '40px' }}>
          <h2>Active Users Metrics (since {activeUsersSinceDate})</h2>
          <div style={{ background: '#fff3e0', padding: '20px', borderRadius: '5px' }}>
            <h3 style={{ fontSize: '2em' }}>Daily Active Users (DAU): {activeUsersStats.dau}</h3>
            <p style={{ fontStyle: 'italic' }}>
              Unique users active every day since the reference date. For example, if you select today's date,
              DAU corresponds to today's active users. If you select an earlier date, only users who have been active every day since that date are counted.
            </p>
            <h3 style={{ fontSize: '2em' }}>Weekly Active Users (WAU): {activeUsersStats.wau}</h3>
            <p style={{ fontStyle: 'italic' }}>
              Unique users active at least once during a 7-day window starting from the reference date. (N/A if period is insufficient)
            </p>
            <h3 style={{ fontSize: '2em' }}>Monthly Active Users (MAU): {activeUsersStats.mau}</h3>
            <p style={{ fontStyle: 'italic' }}>
              Unique users active at least once during a 30-day window starting from the reference date. (N/A if period is insufficient)
            </p>
            <h3 style={{ fontSize: '2em' }}>Semesterly Active Users (SAU): {activeUsersStats.sau}</h3>
            <p style={{ fontStyle: 'italic' }}>
              Unique users active at least once during a 180-day window starting from the reference date. (N/A if period is insufficient)
            </p>
            <h3 style={{ fontSize: '2em' }}>Returning Users: {activeUsersStats.returning_users}</h3>
            <p style={{ fontStyle: 'italic' }}>
              Users active 30 days ago who returned in the last 7 days.
            </p>
            <h3 style={{ fontSize: '2em' }}>Churn Rate: {activeUsersStats.churn_rate}%</h3>
            <p style={{ fontStyle: 'italic' }}>
              Percentage of users who dropped off from last month.
            </p>
            <h3 style={{ fontSize: '2em' }}>Avg messages per user: {activeUsersStats.avg_sessions_per_user}</h3>
            <p style={{ fontStyle: 'italic' }}>
              Average number of messages per user since the reference date.
            </p>
            <h3 style={{ fontSize: '2em' }}>Rolling Retention (14 days): {activeUsersStats.rolling_retention_14_days}%</h3>
            <p style={{ fontStyle: 'italic' }}>
              Percentage of users returning after 14 days.
            </p>
          </div>
        </div>
      )}

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default UserAnalytics;
