// Mock trip fetching service. Replace with real API calls.
import axios from 'axios';


export async function fetchUserTrips(userId){
// Example: call your backend endpoint
// return axios.get(`/api/users/${userId}/trips`).then(r=>r.data);


// Mock data structure expected by MapTimeline
return [
{
id: 't1',
from: 'Dhaka',
to: 'Chattogram',
startDate: '2025-10-01',
endDate: '2025-10-02',
center: { lat: 22.3569, lng: 91.7832 }
},
{
id: 't2',
from: 'Chattogram',
to: 'Cox\'s Bazar',
startDate: '2025-10-05',
endDate: '2025-10-06',
center: { lat: 21.4272, lng: 92.0058 }
}
];
}