import React, { useState, useEffect } from 'react';

// --- AWS Amplify Imports ---
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import { fetchAuthSession } from 'aws-amplify/auth';
import '@aws-amplify/ui-react/styles.css';

// --- Recharts & Lucide Icons Imports ---
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Thermometer, Droplets, Clock, AlertCircle, RefreshCw } from 'lucide-react';

// --- Configure Cognito ---
// REMOVED SECRETS: Replace these placeholders with your actual AWS resource values or use environment variables (e.g., process.env.REACT_APP_USER_POOL_ID)
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'YOUR_USER_POOL_ID', 
      userPoolClientId: 'YOUR_USER_POOL_CLIENT_ID', 
    }
  }
});

// --- Main App Component (Authentication Wrapper) ---
export default function App() {
  return (
    <Authenticator hideSignUp={true}>
      {({ signOut, user }) => (
        <main className="min-h-screen bg-gray-50">
          {/* Top Navigation Bar */}
          <div className="px-6 py-4 bg-gray-900 text-white flex justify-between items-center shadow-md">
            <span className="font-medium">Welcome, {user?.signInDetails?.loginId}!</span>
            <button 
              onClick={signOut}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Sign Out
            </button>
          </div>
          
          {/* Dashboard Content */}
          <SensorDashboard />
        </main>
      )}
    </Authenticator>
  );
}

// --- Sensor Dashboard Component ---
function SensorDashboard() {
  const [chartData, setChartData] = useState([]);
  const [latestData, setLatestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState('');

  const parseTimestamp = (timeStr) => {
    if (!timeStr) return new Date();
    if (timeStr.includes('T') && timeStr.includes('Z')) return new Date(timeStr);
    // Keep the Chinese replacement logic in case your database stores localized time strings
    let cleanStr = timeStr.replace('下午', 'PM').replace('上午', 'AM');
    let parsedDate = new Date(cleanStr);
    if (isNaN(parsedDate.getTime())) return new Date();
    return parsedDate;
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString(); 

      // REMOVED SECRET: Replace with your actual API Gateway URL
      const API_URL = 'YOUR_API_GATEWAY_URL';

      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '', 
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();

      const validData = result
        .map(item => ({
          temperature: parseFloat(item.temperature) || 0,
          humidity: parseFloat(item.humidity) || 0,
          rawDate: parseTimestamp(item.timestamp),
        }))
        .filter(item => item.temperature !== 0 || item.humidity !== 0)
        .sort((a, b) => a.rawDate - b.rawDate);

      if (validData.length > 0) {
        setLatestData(validData[validData.length - 1]);
      }

      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const recentData = validData.filter(item => item.rawDate >= threeDaysAgo);

      const hourlyGroups = {};
      recentData.forEach(item => {
        const d = item.rawDate;
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hour = String(d.getHours()).padStart(2, '0');
        
        const groupKey = `${year}-${month}-${day} ${hour}:00`;
        
        if (!hourlyGroups[groupKey]) {
          hourlyGroups[groupKey] = {
            sumTemp: 0, sumHum: 0, count: 0,
            rawDate: new Date(year, d.getMonth(), d.getDate(), d.getHours(), 0, 0)
          };
        }
        
        hourlyGroups[groupKey].sumTemp += item.temperature;
        hourlyGroups[groupKey].sumHum += item.humidity;
        hourlyGroups[groupKey].count += 1;
      });

      const aggregatedData = Object.keys(hourlyGroups).map(key => {
        const group = hourlyGroups[key];
        return {
          temperature: parseFloat((group.sumTemp / group.count).toFixed(2)),
          humidity: parseFloat((group.sumHum / group.count).toFixed(2)),
          rawDate: group.rawDate,
          timeLabel: `${group.rawDate.getMonth() + 1}/${group.rawDate.getDate()} ${String(group.rawDate.getHours()).padStart(2, '0')}:00`
        };
      });

      aggregatedData.sort((a, b) => a.rawDate - b.rawDate);
      setChartData(aggregatedData);
      setLastUpdated(new Date().toLocaleTimeString());
      
    } catch (err) {
      console.error("Error fetching data:", err);
      // Special handling for "Failed to fetch", which is usually a CORS issue
      if (err.message === 'Failed to fetch') {
        setError('Failed to fetch: Possible CORS issue. Please enable CORS in AWS API Gateway and ensure Access-Control-Allow-Headers includes Authorization.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4 md:p-8 font-sans text-gray-800">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Home Environment Dashboard</h1>
            <div className="flex items-center text-sm text-gray-500 mt-2">
              <Clock className="w-4 h-4 mr-1" />
              Last Updated: {lastUpdated || '--:--:--'}
            </div>
          </div>
          <button 
            onClick={fetchData}
            disabled={loading}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-red-800 font-medium">Failed to fetch data</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && latestData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
              <div className="p-4 bg-red-50 rounded-full mr-4">
                <Thermometer className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Current Temperature</p>
                <p className="text-3xl font-bold text-gray-900">{latestData.temperature.toFixed(1)}<span className="text-xl text-gray-500 ml-1">°C</span></p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
              <div className="p-4 bg-blue-50 rounded-full mr-4">
                <Droplets className="w-8 h-8 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Current Humidity</p>
                <p className="text-3xl font-bold text-gray-900">{latestData.humidity.toFixed(1)}<span className="text-xl text-gray-500 ml-1">%</span></p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Historical Trends</h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full mt-2 sm:mt-0">
              Last 3 Days (Hourly Average)
            </span>
          </div>
          
          {loading && chartData.length === 0 ? (
            <div className="h-80 flex flex-col items-center justify-center text-gray-400">
              <RefreshCw className="w-8 h-8 animate-spin mb-2" />
              <p>Loading data...</p>
            </div>
          ) : chartData.length > 0 ? (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="timeLabel" tick={{ fontSize: 12, fill: '#6b7280' }} tickMargin={10} minTickGap={30} />
                  <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#ef4444' }} domain={['auto', 'auto']} tickFormatter={(val) => `${val}°C`} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#3b82f6' }} domain={['auto', 'auto']} tickFormatter={(val) => `${val}%`} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} labelStyle={{ fontWeight: 'bold', color: '#374151', marginBottom: '4px' }} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#ef4444" strokeWidth={3} dot={{ r: 3, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Avg Temperature" />
                  <Line yAxisId="right" type="monotone" dataKey="humidity" stroke="#3b82f6" strokeWidth={3} dot={{ r: 3, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Avg Humidity" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-400">
              <p>No data available for the last 3 days</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
