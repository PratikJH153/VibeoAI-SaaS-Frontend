import {useAuth} from "@clerk/clerk-react"

export const useApi = () => {
  const {getToken} = useAuth();

  const makeRequest = async (endpoint: any, options = {}) => {
    const token = await getToken();
    const defaultOptions = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
    const mergedOptions = {...defaultOptions, ...options};
    const response = await fetch(`http://localhost:8000/api/${endpoint}`, mergedOptions);
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (response.status === 429){
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      throw new Error(errorData?.detail || 'An error occurred while making the request.');
    }


    return response.json();
  }

  return {makeRequest};
}