import config from '../config';  // Utilisez import au lieu de require
import { db } from '../auth/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

// Définir le préfixe de l'URL de l'API en fonction de l'environnement
const apiUrlPrefix: string = config.server_url;

type TimeFilter = 'Today' | 'Last Week' | 'Last Month' | 'Last Year';
type UniversityFilter = string; // 'All', 'Harvard', 'MIT', etc.

interface RequestDataResponse {
    count: number;  // The number of requests found in the specified filters
    dates: Date[];  // Dates of the matching requests for charting
}

// Function to send the backend the filter parameters and return the number of requests and dates
export const fetchRequestData = async (timeFilter: TimeFilter, universityFilter: UniversityFilter): Promise<RequestDataResponse> => {
    try {
        // Prepare the request body with both filters
        const requestBody = {
            timeFilter,
            universityFilter,
        };

        // API call to fetch filtered request data
        const response = await fetch(`${apiUrlPrefix}/requests/filtered`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),  // Sending the filters to the backend
        });

        // Handle error responses from the server
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch request data: ${errorText}`);
        }

        // Parse the response from the server
        const data: RequestDataResponse = await response.json();

        console.log('Successfully fetched request data:', data);

        // Return the count of matching requests and their corresponding dates
        return data;
    } catch (error) {
        console.error('Error fetching request data:', error);
        throw error;
    }
};
