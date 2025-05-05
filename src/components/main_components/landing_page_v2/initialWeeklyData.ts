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
    day: string;
    dueDate?: Date | { start: Date; end: Date };
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
    startDate: Date;
    deadlines: Deadline[];
    usefulLinks: UsefulLink[];
    features: FeatureItem[]; 
    currentMonth: string; 
}

// --- Données Initiales --- 
export const initialAllWeeksData: WeeklyData[] = [
    { // Semaine 1
        currentMonth: 'April',
        dateRange: 'April 15-21',
        startDate: new Date('2025-04-15T00:00:00'),
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
    { // Semaine 2: April 22-28
        currentMonth: 'April',
        dateRange: 'April 22-28', 
        startDate: new Date('2025-04-22T00:00:00'),
        focusTitle: 'Financial Aid & Housing Deposit',
        deadlines: [ 
            {
                id: 'finaid-today-apr2',
                title: 'Accept Financial Aid Package', 
                day: 'Today',
                isWarning: true,
                items: [
                    { id: 'fa1', text: 'Review financial aid offer', isDone: false },
                    { id: 'fa2', text: 'Accept/Decline specific awards', isDone: false },
                    { id: 'fa3', text: 'Complete required loan entrance counseling', isDone: false },
                ]
            },
            {
                id: 'housing-deposit-tmr-apr2',
                title: 'Pay Housing Deposit',
                day: 'Tomorrow',
                isWarning: true,
                items: [
                    { id: 'hd1', text: 'Find housing deposit amount and deadline', isDone: false },
                    { id: 'hd2', text: 'Submit deposit payment online', isDone: false },
                ]
            }
        ],
        usefulLinks: [
            { text: 'Understanding your Financial Aid', linkText: 'Financial Aid Office', description: 'Detailed explanations and FAQs.' },
            { text: 'Housing Options and Deposits', linkText: 'Housing Portal', description: 'View residence halls and payment info.' }
        ],
        features: [
            {
                title: 'Budgeting Tools & Resources', 
                image: '/Campus-min.png' // Placeholder image
            }
        ],
    },
    { // Semaine 3: April 29 - May 5 (La nouvelle semaine demandée)
        currentMonth: 'May', // Chevauche Avril/Mai, mettre Mai?
        dateRange: 'April 29 - May 5', 
        startDate: new Date('2025-04-29T00:00:00'),
        focusTitle: 'Explore Campus Resources & Health Forms',
        deadlines: [
            {
                id: 'health-forms-today-apr3',
                title: 'Submit Immunization Records', 
                day: 'Today',
                isWarning: false,
                items: [
                    { id: 'hf1', text: 'Gather required vaccination documents', isDone: false },
                    { id: 'hf2', text: 'Upload forms to Health Services portal', isDone: false },
                ]
            },
            {
                id: 'campus-map-tmr-apr3',
                title: 'Explore Campus Map',
                day: 'Tomorrow',
                isWarning: false,
                items: [
                    { id: 'cm1', text: 'Locate key buildings (library, student union)', isDone: false },
                    { id: 'cm2', text: 'Identify dining hall locations', isDone: false },
                ]
            }
        ],
        usefulLinks: [
            { text: 'Student Health Services', linkText: 'Health Portal', description: 'Access forms and health requirements.' },
            { text: 'Interactive Campus Map', linkText: 'Campus Map', description: 'Find your way around campus.' },
            { text: 'Academic Support Centers', linkText: 'Learning Resources', description: 'Info on tutoring and writing centers.' },
        ],
        features: [
            {
                title: 'Virtual Campus Tour Available',
                image: '/Castle-min.png' // Placeholder
            }
        ],
    },
    { // Semaine 4: May 6-12
        currentMonth: 'May',
        dateRange: 'May 6-12',
        startDate: new Date('2025-05-06T00:00:00'),
        focusTitle: 'Finding communities and clubs',
        deadlines: [], 
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
    { // Semaine 5: June 5-12 (Anciennement semaine 3)
        currentMonth: 'June',
        dateRange: 'June 5-12',
        startDate: new Date('2025-06-05T00:00:00'),
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
     { // Semaine 6: June 13-19 (Anciennement semaine 4)
        currentMonth: 'June',
        dateRange: 'June 13-19',
        startDate: new Date('2025-06-13T00:00:00'),
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
                isWarning: false,
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