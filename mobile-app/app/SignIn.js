// SignIn.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { auth, db } from '../auth/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../auth/hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config';

const allowedDomains = {
    upenn: [/^.+@([a-zA-Z0-9._-]+\.)*upenn\.edu$/i, /^.+@my-lucy\.com$/i],
    harvard: [/^.+@([a-zA-Z0-9._-]+\.)*harvard\.edu$/i, /^.+@my-lucy\.com$/i],
    mit: [/^.+@([a-zA-Z0-9._-]+\.)*mit\.edu$/i, /^.+@my-lucy\.com$/i],
    lasell: [/^.+@([a-zA-Z0-9._-]+\.)*lasell\.edu$/i, /^.+@my-lucy\.com$/i],
    oakland: [/^.+@([a-zA-Z0-9._-]+\.)*oakland\.edu$/i, /^.+@my-lucy\.com$/i],
    arizona: [/^.+@([a-zA-Z0-9._-]+\.)*arizona\.edu$/i, /^.+@my-lucy\.com$/i],
    uci: [/^.+@([a-zA-Z0-9._-]+\.)*uci\.edu$/i, /^.+@my-lucy\.com$/i],
    ucidavis: [/^.+@([a-zA-Z0-9._-]+\.)*ucidavis\.edu$/i, /^.+@my-lucy\.com$/i],
    cornell: [/^.+@([a-zA-Z0-9._-]+\.)*cornell\.edu$/i, /^.+@my-lucy\.com$/i],
    berkeleycollege: [
      /^.+@([a-zA-Z0-9._-]+\.)*berkeleycollege\.edu$/i,
      /^.+@my-lucy\.com$/i,
    ],
    brown: [/^.+@([a-zA-Z0-9._-]+\.)*brown\.edu$/i, /^.+@my-lucy\.com$/i],
    stanford: [/^.+@([a-zA-Z0-9._-]+\.)*stanford\.edu$/i, /^.+@my-lucy\.com$/i],
    berkeley: [/^.+@([a-zA-Z0-9._-]+\.)*berkeley\.edu$/i, /^.+@my-lucy\.com$/i],
    miami: [/^.+@([a-zA-Z0-9._-]+\.)*miami\.edu$/i, /^.+@my-lucy\.com$/i],
    drexel: [/^.+@([a-zA-Z0-9._-]+\.)*drexel\.edu$/i, /^.+@my-lucy\.com$/i],
    temple: [/^.+@([a-zA-Z0-9._-]+\.)*temple\.edu$/i, /^.+@my-lucy\.com$/i],
    admin: [/^.+@my-lucy\.com$/i],
  };

const isEmail = (email) =>
  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email);

const getAllowedDomains = (subdomain) => allowedDomains[subdomain] || [];

const isAllowedEmail = (email, subdomain) => {
  const domains = getAllowedDomains(subdomain);
  return domains.some((regex) => regex.test(email));
};

const getErrorMessage = (subdomain) => {
    const universityNames = {
      upenn: 'Upenn',
      harvard: 'Harvard',
      mit: 'MIT',
      lasell: 'Lasell',
      oakland: 'Oakland',
      arizona: 'Arizona',
      uci: 'UCI',
      ucdavis: 'UC Davis',
      cornell: 'Cornell',
      berkeleycollege: 'Berkeley College',
      brown: 'Brown',
      stanford: 'Stanford',
      berkeley: 'Berkeley',
      miami: 'Miami',
      drexel: 'Drexel',
      temple: 'Temple',
      admin: 'Admin',
    };
  
    return `Only ${
      universityNames[subdomain] || 'email addresses from allowed domains'
    } can register`;
  };

const SignIn = ({ handleToggleThemeMode }) => {
  const { login, isAuth, loading } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const { course_id } = route.params || {};
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!loading && isAuth) {
      console.log('SignIn: User already authenticated, redirecting...');
      // Retrieve user info from AsyncStorage
      const retrieveUserData = async () => {
        try {
          const storedUser = await AsyncStorage.getItem('user');
          const user = storedUser ? JSON.parse(storedUser) : {};
          const userRole = user.role;
          const uid = user.id;
          const userName = user.name;

          if (config.subdomain === 'admin') {
            navigation.navigate('AdminDashboard', { userName });
          } else if (userRole === 'student') {
            navigation.navigate('StudentDashboard', { uid, userName });
          } else if (userRole === 'academic_advisor') {
            navigation.navigate('AcademicAdvisorDashboard', { uid, userName });
          } else {
            navigation.navigate('Dashboard');
          }
        } catch (error) {
          console.error('Error retrieving user data:', error);
        }
      };
      retrieveUserData();
    }
  }, [isAuth, loading]);

  const storeUserData = async (
    user,
    role,
    name,
    firstCourseId,
    lastChatId,
    studentProfile,
    major,
    minor,
    year,
    faculty
  ) => {
    const subdomain = config.subdomain;
    console.log('SignIn: Storing data in AsyncStorage.');
    try {
      await AsyncStorage.setItem('isAuth', 'true');
      await AsyncStorage.setItem(
        'user',
        JSON.stringify({ id: user.uid, name, email: user.email, role })
      );
      await AsyncStorage.setItem('course_id', firstCourseId || '');
      await AsyncStorage.setItem('chat_id', lastChatId || '');
      await AsyncStorage.setItem('university', subdomain);
      await AsyncStorage.setItem(
        'student_profile',
        JSON.stringify(studentProfile)
      );
      await AsyncStorage.setItem(
        'major',
        JSON.stringify(major) || 'default_major'
      );
      await AsyncStorage.setItem(
        'minor',
        JSON.stringify(minor) || 'default_minor'
      );
      await AsyncStorage.setItem('year', year || 'default_year');
      await AsyncStorage.setItem(
        'faculty',
        JSON.stringify(faculty) || 'default_faculty'
      );
    } catch (error) {
      console.error('Error storing data in AsyncStorage', error);
    }
  };

  const redirectBasedOnRole = (role, userName, uid) => {
    const subdomain = config.subdomain;
    console.log(`SignIn: Redirecting based on role ${role}.`);
    if (subdomain === 'admin') {
      navigation.navigate('AdminDashboard', { userName });
      return;
    }

    if (role === 'student') {
      navigation.navigate('StudentDashboard', { uid, userName });
    } else if (role === 'academic_advisor') {
      navigation.navigate('AcademicAdvisorDashboard', { uid, userName });
    } else {
      navigation.navigate('Dashboard');
    }
  };

  const handleSubmit = async () => {
    setErrors({});
    setIsLoading(true);

    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!isEmail(email)) {
      newErrors.email = 'Please provide a valid email';
    } else if (!isAllowedEmail(email, config.subdomain)) {
      newErrors.email = getErrorMessage(config.subdomain);
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      console.log('SignIn: Validation errors detected:', newErrors);
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      console.log('SignIn: Attempting to sign in with Firebase.');
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log('SignIn: Sign in successful:', user);

      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        console.log('SignIn: User data found in Firestore.');
        const userData = docSnap.data();
        const userRole = userData.role;
        const userName = userData.name;
        const firstCourseId = userData.courses
          ? userData.courses[0]
          : null;
        const lastChatId = userData.chatsessions
          ? userData.chatsessions.slice(-1)[0]
          : null;
        const studentProfile = userData.student_profile;
        const major = userData.major || ['default_major'];
        const minor = userData.minor || ['default_minor'];
        const year = userData.year || 'default_year';
        const faculty = userData.faculty || 'default_faculty';

        await storeUserData(
          user,
          userRole,
          userName,
          firstCourseId,
          lastChatId,
          studentProfile,
          major,
          minor,
          year,
          faculty
        );

        console.log('SignIn: Updating auth context.');
        login({
          id: user.uid,
          name: userName,
          email: email,
          role: userRole,
        });

        redirectBasedOnRole(userRole, userName, user.uid);
      } else {
        console.log('SignIn: No user data found in Firestore.');
        setErrors({ email: 'No user data found' });
        setIsLoading(false);
      }
    } catch (error) {
      console.error('SignIn: Error during sign in:', error);
      const newErrors = {};
      if (error.code === 'auth/user-not-found') {
        newErrors.email = 'No user found with this email';
      } else if (error.code === 'auth/wrong-password') {
        newErrors.password = 'Incorrect password';
      } else if (error.code === 'auth/too-many-requests') {
        newErrors.email = 'Account access blocked! Try again later';
      } else {
        newErrors.email = 'Login failed';
      }
      setErrors(newErrors);
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../assets/university_logo.png')} // Update the path to your university logo
          style={styles.logo}
          resizeMode="contain"
        />
        <TouchableOpacity onPress={handleToggleThemeMode}>
          {/* Implement theme toggle functionality */}
          <Text style={styles.toggleText}>Toggle Theme</Text>
        </TouchableOpacity>
      </View>

      {/* Form */}
      <View style={styles.formContainer}>
        <Text style={styles.title}>Sign In</Text>
        <Text style={styles.subtitle}>
          For the purpose of industry regulation, your details are required.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Email Address"
          onChangeText={setEmail}
          value={email}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        {errors.email && (
          <Text style={styles.errorText}>{errors.email}</Text>
        )}

        <TextInput
          style={styles.input}
          placeholder="Password"
          onChangeText={setPassword}
          value={password}
          secureTextEntry
        />
        {errors.password && (
          <Text style={styles.errorText}>{errors.password}</Text>
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('SignUp', { course_id })}
        >
          <Text style={styles.linkText}>
            Don't have an account yet? Create one now!
          </Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>powered by Lucy</Text>
        <Image
          source={require('../assets/logo_lucy.png')} // Update the path to your Lucy logo
          style={styles.footerLogo}
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    height: 50,
    width: 100,
  },
  toggleText: {
    color: '#007AFF',
  },
  formContainer: {
    flex: 1,
    marginTop: 50,
    padding: 16,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 24,
  },
  subtitle: {
    fontWeight: '800',
    fontSize: 16,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 16,
  },
  errorText: {
    color: 'red',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  linkText: {
    color: '#007AFF',
    marginTop: 16,
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  footerText: {
    marginRight: 8,
  },
  footerLogo: {
    width: 20,
    height: 20,
  },
});

export default SignIn;