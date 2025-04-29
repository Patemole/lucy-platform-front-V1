// src/components/main_components/landing_page_v2/initialWeeklyData.ts

// --- Interfaces (partagées ou définies ici) ---
// Idéalement, déplacer dans src/interfaces/
export interface DeadlineItem {
    id: string;
    text: string;
    isDone?: boolean;
}
export interface Deadline {
    id: string;
    title: string;
    items: DeadlineItem[];
    isWarning?: boolean;
    day: 'Today' | 'Tomorrow';
}
export interface UsefulLink {
    text: string;
    linkText: string;
    description: string;
}
export interface FeatureItem {
    title: string;
    image?: string;
}
export interface WeeklyData {
    // Note: Pas d'ID Firestore ici car ce sont les données *avant* insertion
    dateRange: string;
    focusTitle: string;
    // startDate?: Date; // Si vous l'ajoutez
    deadlines: Deadline[];
    usefulLinks: UsefulLink[];
    features: FeatureItem[]; 
    currentMonth: string; 
}

// --- Données Initiales --- 
export const initialAllWeeksData: WeeklyData[] = [
    { // Semaine 1: April 15-21
        currentMonth: 'April',
        dateRange: 'April 15-21',
        focusTitle: 'Checking your transfer credits & AP scores',
        deadlines: [
            {
                id: 'ap-today',
                title: 'AP Scores Submission',
                day: 'Today',
                isWarning: true,
                items: [
                    { id: 'ap1', text: 'Send official AP score report', isDone: false },
                    { id: 'ap2', text: 'Confirm receipt with admissions', isDone: false },
                    { id: 'ap3', text: 'Check equivalent courses credited', isDone: false },
                ]
            },
            {
                id: 'transfer-tomorrow',
                title: 'Transfer Credit Evaluation',
                day: 'Tomorrow',
                isWarning: false,
                items: [
                    { id: 'tc1', text: 'Submit final transcript from previous institution', isDone: false },
                    { id: 'tc2', text: 'Meet with advisor about transfer credits', isDone: false },
                ]
            }
        ],
        usefulLinks: [
            { text: 'Need help with your transfer credits?', linkText: 'Visit the Registrar Office', description: 'Official university policy and contact information.' },
            { text: 'AP score credit policy', linkText: 'Check the policy', description: 'Details on which scores grant credit.' }
        ],
        features: [
            { 
                title: 'Roommate Matching - coming soon', 
                image: '/Homecoming-min.png', 
            },
            { 
                title: '4 Year Degree Planning - coming soon', 
                image: '/Castle-min.png', 
            }
        ],
    },
    { // Semaine 2: May 20-26
        currentMonth: 'May',
        dateRange: 'May 20-26',
        focusTitle: 'Finding communities and clubs',
        deadlines: [], // Pas de deadlines cette semaine
        usefulLinks: [
            { text: 'Explore student organizations', linkText: 'Club Directory', description: 'Find groups based on your interests.' },
            { text: 'Upcoming campus events', linkText: 'Events Calendar', description: 'See what\'s happening on campus.' }
        ],
        features: [
            {
                title: 'Tinder Event - discover local events',
                image: '/Campus-min.png',
            }
        ],
    },
    { // Semaine 3: June 5-12
        currentMonth: 'June',
        dateRange: 'June 5-12',
        focusTitle: 'Choosing and register for you classes',
        deadlines: [
            {
                id: 'classes-today-june',
                title: 'Class registration',
                day: 'Today',
                isWarning: true,
                items: [ 
                    { id: 'cr1', text: 'Register for Calculus I', isDone: false },
                    { id: 'cr2', text: 'Select Writing Seminar', isDone: false },
                    { id: 'cr3', text: 'Check required courses for major', isDone: false },
                    { id: 'cr4', text: 'Review class schedule', isDone: false },
                ]
            },
            {
                id: 'chill-tomorrow-june',
                title: 'Nothing to do just chill', 
                day: 'Tomorrow',
                isWarning: false,
                items: [] 
            }
        ],
        usefulLinks: [], 
        features: [],
    },
     { // Semaine 4: June 13-19
        currentMonth: 'June', // Toujours Juin
        dateRange: 'June 13-19',
        focusTitle: 'Finalize schedule and check prerequisites',
        deadlines: [
            {
                id: 'prereq-today-june2',
                title: 'Check Prerequisites',
                day: 'Today',
                isWarning: true,
                items: [ 
                    { id: 'pr1', text: 'Verify Math prerequisite', isDone: false },
                    { id: 'pr2', text: 'Confirm language requirement', isDone: false },
                ]
            },
            {
                id: 'advisor-today-june2',
                title: 'Meet Advisor',
                day: 'Today',
                isWarning: false, // Pas d'alerte pour celle-ci
                items: [
                    { id: 'adv1', text: 'Prepare questions for advisor', isDone: false },
                ]
            },
             {
                id: 'books-tomorrow-june2',
                title: 'Order Books',
                day: 'Tomorrow',
                isWarning: false,
                items: [
                     { id: 'bk1', text: 'Check bookstore for required texts', isDone: false },
                     { id: 'bk2', text: 'Compare prices online', isDone: false },
                ]
            }
        ],
        usefulLinks: [], 
        features: [
            {
                title: 'Study Abroad Options',
                image: '/Castle-min.png',
            }
        ],
    },
]; 