import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';
import config from '../config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../auth/firebase';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

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

const UserAnalytics = () => {
  // State for user search, conversation statistics, user statistics, and active users metrics
  const [searchType, setSearchType] = useState<'uid' | 'name' | 'university'>('uid');
  const [uid, setUid] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [universityData, setUniversityData] = useState<UniversityUserCount | null>(null);
  const [conversationStats, setConversationStats] = useState<ConversationStatistics | null>(null);
  const [userStats, setUserStats] = useState<UserStatistics | null>(null);
  const [activeUsersStats, setActiveUsersStats] = useState<ActiveUsersMetrics | null>(null);

  // Date inputs for each section
  const [sinceDate, setSinceDate] = useState('');           // for conversation statistics
  const [userSinceDate, setUserSinceDate] = useState('');       // for user statistics
  const [activeUsersSinceDate, setActiveUsersSinceDate] = useState(''); // for active users metrics

  const theme = useTheme();
  const navigate = useNavigate();
  const { user, logout, chatIds, setPrimaryChatId } = useAuth();

  const apiUrlPrefix: string = config.server_url;

  // Function to get uid by name
  const getUidByName = async (name: string): Promise<string | null> => {
    console.log('searching for user with name:', name);
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('name', '==', name));
    const querySnapshot = await getDocs(q);
    console.log('query snapshot size:', querySnapshot.size);
    if (querySnapshot.empty) {
      console.warn('no user found with name:', name);
      return null;
    }
    const docData = querySnapshot.docs[0].data();
    console.log('user found:', querySnapshot.docs[0].id, docData);
    return querySnapshot.docs[0].id;
  };

  // Fetch user data or university count based on search type
  const fetchUserData = async () => {
    if (!uid) return;
    setLoading(true);
    setError(null);
    setUserData(null);
    setUniversityData(null);
    setConversationStats(null);
    setUserStats(null);
    setActiveUsersStats(null);

    if (searchType === 'university') {
      console.log('search type is "university", fetching university user count for:', uid);
      try {
        const response = await fetch(`${apiUrlPrefix}/analytics/university_user_count`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ university: uid })
        });
        if (!response.ok) {
          const errData = await response.json();
          setError(errData.detail || 'an error occurred');
          setLoading(false);
          return;
        }
        const data = await response.json();
        console.log('university data retrieved:', data);
        setUniversityData(data);
      } catch (err) {
        setError('error fetching university data');
      }
      setLoading(false);
      return;
    }

    let searchUid = uid;
    if (searchType === 'name') {
      console.log('search type is "name", resolving uid for name:', uid);
      const resolvedUid = await getUidByName(uid);
      if (!resolvedUid) {
        setError('user not found by name');
        console.error('resolved uid is null for name:', uid);
        setLoading(false);
        return;
      }
      console.log('resolved uid:', resolvedUid);
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
        setError(errData.detail || 'an error occurred');
        setLoading(false);
        return;
      }
      const data = await response.json();
      setUserData(data);
    } catch (err) {
      setError('error fetching user data');
    }
    setLoading(false);
  };

  // Fetch conversation statistics using the selected date
  const fetchConversationStats = async () => {
    if (!sinceDate) {
      setError('please select a date before fetching conversation statistics');
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
        setError(errData.detail || 'an error occurred');
        setLoading(false);
        return;
      }
      const data = await response.json();
      console.log('conversation statistics retrieved:', data);
      setConversationStats(data);
    } catch (err) {
      setError('error fetching conversation statistics');
    }
    setLoading(false);
  };

  // Fetch user statistics using the selected date
  const fetchUserStats = async () => {
    if (!userSinceDate) {
      setError('please select a date before fetching user statistics');
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
        setError(errData.detail || 'an error occurred');
        setLoading(false);
        return;
      }
      const data = await response.json();
      console.log('user statistics retrieved:', data);
      setUserStats(data);
    } catch (err) {
      setError('error fetching user statistics');
    }
    setLoading(false);
  };

  // Fetch active users metrics using the selected date
  const fetchActiveUsers = async () => {
    if (!activeUsersSinceDate) {
      setError('please select a date before fetching active users metrics');
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
        setError(errData.detail || 'an error occurred');
        setLoading(false);
        return;
      }
      const data = await response.json();
      console.log('active users metrics retrieved:', data);
      setActiveUsersStats(data);
    } catch (err) {
      setError('error fetching active users metrics');
    }
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      fetchUserData();
    }
  };

  // Prepare data for conversation statistics pie charts
  const privacyData = conversationStats
    ? Object.entries(conversationStats.privacy_distribution).map(([key, value]) => ({
        name: key,
        value: value
      }))
    : [];
  const topicData = conversationStats
    ? Object.entries(conversationStats.topic_distribution).map(([key, value]) => ({
        name: key,
        value: value
      }))
    : [];
  const nameData = conversationStats
    ? Object.entries(conversationStats.name_distribution).map(([key, value]) => ({
        name: key,
        value: value
      }))
    : [];

  // Prepare data for user statistics pie charts (renamed to avoid conflict)
  const universityChartData = userStats
    ? Object.entries(userStats.university_distribution).map(([key, value]) => ({
        name: key,
        value: value
      }))
    : [];
  const yearChartData = userStats
    ? Object.entries(userStats.year_distribution).map(([key, value]) => ({
        name: key,
        value: value
      }))
    : [];
  const clubStatusChartData = userStats
    ? Object.entries(userStats.registered_club_status_distribution).map(([key, value]) => ({
        name: key,
        value: value
      }))
    : [];

  return (
    <div style={{ padding: '20px' }}>
      <h1>User Analytics</h1>
      {/* --- User Search Section --- */}
      <div style={{ marginBottom: '20px' }}>
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value as 'uid' | 'name' | 'university')}
          style={{ padding: '10px', marginRight: '10px' }}
        >
          <option value="uid">uid</option>
          <option value="name">name</option>
          <option value="university">university</option>
        </select>
        <input
          type="text"
          placeholder="Enter a user uid, name, or university"
          value={uid}
          onChange={(e) => setUid(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{ padding: '10px', width: '300px', marginRight: '10px' }}
        />
        <button onClick={fetchUserData} style={{ padding: '10px', marginLeft: '10px' }}>
          Send
        </button>
      </div>

      {/* --- Conversation Statistics Section --- */}
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

      {/* --- User Statistics Section --- */}
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

      {/* --- Active Users Metrics Section --- */}
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

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* --- Display Conversation Statistics Dashboard --- */}
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
                  <Pie
                    data={privacyData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                  >
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
                  <Pie
                    data={topicData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#82ca9d"
                    label
                  >
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
                  <Pie
                    data={nameData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#ffc658"
                    label
                  >
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

      {/* --- Display User Statistics Dashboard --- */}
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
                  <Pie
                    data={universityChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#0088fe"
                    label
                  >
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
                  <Pie
                    data={yearChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#00c49f"
                    label
                  >
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
                  <Pie
                    data={clubStatusChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#ff8042"
                    label
                  >
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

      {/* --- Display Active Users Dashboard --- */}
      {activeUsersStats && (
        <div style={{ marginTop: '40px' }}>
          <h2>Active Users Metrics (since {activeUsersSinceDate})</h2>
          <div style={{ background: '#fff3e0', padding: '20px', borderRadius: '5px' }}>
            <h3 style={{ fontSize: '2em' }}>Daily Active Users (DAU): {activeUsersStats.dau}</h3>
            <p style={{ fontStyle: 'italic' }}>Unique users active today</p>
            <h3 style={{ fontSize: '2em' }}>Weekly Active Users (WAU): {activeUsersStats.wau}</h3>
            <p style={{ fontStyle: 'italic' }}>Unique users active in the last 7 days</p>
            <h3 style={{ fontSize: '2em' }}>Monthly Active Users (MAU): {activeUsersStats.mau}</h3>
            <p style={{ fontStyle: 'italic' }}>Unique users active in the last 30 days</p>
            <h3 style={{ fontSize: '2em' }}>Semesterly Active Users (SAU): {activeUsersStats.sau}</h3>
            <p style={{ fontStyle: 'italic' }}>Unique users active in the last 180 days</p>
            <h3 style={{ fontSize: '2em' }}>Returning Users: {activeUsersStats.returning_users}</h3>
            <p style={{ fontStyle: 'italic' }}>Users active 30 days ago who returned in the last 7 days</p>
            <h3 style={{ fontSize: '2em' }}>Churn Rate: {activeUsersStats.churn_rate}%</h3>
            <p style={{ fontStyle: 'italic' }}>Percentage of users who dropped off from last month</p>
            <h3 style={{ fontSize: '2em' }}>Avg messages/student: {activeUsersStats.avg_sessions_per_user}</h3>
            <p style={{ fontStyle: 'italic' }}>Average messages per user</p>
            <h3 style={{ fontSize: '2em' }}>Rolling Retention (14 days): {activeUsersStats.rolling_retention_14_days}%</h3>
            <p style={{ fontStyle: 'italic' }}>Percentage of users returning after 14 days</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAnalytics;
