// Mock AI analysis. Replace with real AI model integration (OpenAI, local model, etc.)


export async function analyzeTrip(trip){
// For a real integration: send trip metadata to your AI endpoint, receive analysis
// Example response fields used by components:
return {
risk: mockRisk(trip), // 'Low' | 'Medium' | 'High'
comfortScore: mockComfort(trip), // 0-100
ecoScore: mockEco(trip), // 0-100
insight: 'Generally safe; avoid late-night travel because of limited transport options.',
footprintMeters: 3000
};
}


function mockRisk(t){
// simple heuristic: if distance big -> medium
const dist = Math.abs(t.center.lat - 23.7806) + Math.abs(t.center.lng - 90.2794);
if (dist < 2) return 'Low';
if (dist < 6) return 'Medium';
return 'High';
}
function mockComfort(t){
return Math.round(70 - (Math.random()*20));
}
function mockEco(t){
return Math.round(60 - (Math.random()*30));
}