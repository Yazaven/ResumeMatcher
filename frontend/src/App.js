import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function App() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobFile, setJobFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(savedMode);
    document.documentElement.classList.toggle('dark', savedMode);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
    document.documentElement.classList.toggle('dark', newMode);
  };

  const handleFileChange = (e, setter) => setter(e.target.files[0]);

  const handleSubmit = async () => {
      if (!resumeFile || !jobFile) return alert('Upload both files.');
      setLoading(true);
  
      const form = new FormData();
      form.append('resume', resumeFile);
      form.append('job', jobFile);
  
      try {
          const { data } = await axios.post(
              `${apiUrl}/match`, 
              form,
              { headers: { 'Content-Type': 'multipart/form-data' } }
          );
          setResult(data);
      } catch (err) {
          setResult({ error: err.response?.data?.error || err.message });
      } finally {
          setLoading(false);
      }
  };
  
      
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-2xl transition-all duration-300 hover:shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            AI Resume Matcher
          </h1>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {isDarkMode ? (
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>

        <div className="space-y-6 mb-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Resume (PDF/DOCX)</label>
              <div className="relative cursor-pointer rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 transition-colors duration-200 p-4">
                <input 
                  type="file" 
                  accept=".pdf,.docx" 
                  onChange={e => handleFileChange(e, setResumeFile)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="text-center">
                  <span className="text-blue-600 dark:text-blue-400 font-medium">Click to upload resume</span>
                  {resumeFile && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{resumeFile.name}</p>}
                </div>
              </div>
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Job Description (PDF/DOCX)</label>
              <div className="relative cursor-pointer rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 transition-colors duration-200 p-4">
                <input 
                  type="file" 
                  accept=".pdf,.docx" 
                  onChange={e => handleFileChange(e, setJobFile)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="text-center">
                  <span className="text-blue-600 dark:text-blue-400 font-medium">Click to upload job description</span>
                  {jobFile && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{jobFile.name}</p>}
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={handleSubmit} 
            disabled={loading}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300 ${
              loading ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' : 
              'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Analyzing Documents...</span>
              </div>
            ) : (
              'Generate Match Report'
            )}
          </button>
        </div>

        {result && (
          <div className="mt-8 space-y-6 animate-fade-in">
            {result.error ? (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700">
                <p className="text-red-600 dark:text-red-200 font-medium">{result.error}</p>
              </div>
            ) : (
              <>
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center bg-green-50 dark:bg-green-900 px-6 py-2 rounded-full">
                    <span className="text-2xl font-bold text-green-700 dark:text-green-300">Match Score: {result.match_score}%</span>
                    <svg 
                      className="w-6 h-6 ml-2 text-green-600 dark:text-green-400" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M5 13l4 4L19 7" 
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{result.insights}</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Skill Analysis Breakdown</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={result.chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#4b5563' : '#e5e7eb'} />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: isDarkMode ? '#d1d5db' : '#4b5563' }} 
                        axisLine={{ stroke: isDarkMode ? '#4b5563' : '#d1d5db' }}
                      />
                      <YAxis 
                        domain={[0, 100]} 
                        tick={{ fill: isDarkMode ? '#d1d5db' : '#4b5563' }}
                        axisLine={{ stroke: isDarkMode ? '#4b5563' : '#d1d5db' }}
                        tickLine={{ stroke: isDarkMode ? '#4b5563' : '#d1d5db' }}
                      />
                      <Tooltip 
                        contentStyle={{
                          background: isDarkMode ? '#374151' : '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          color: isDarkMode ? '#f3f4f6' : '#111827'
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                        formatter={(value) => (
                          <span className={isDarkMode ? "text-gray-200" : "text-gray-600"}>{value}</span>
                        )}
                      />
                      <Bar 
                        dataKey="score" 
                        radius={[4, 4, 0, 0]}
                        background={{ fill: isDarkMode ? '#4b5563' : '#f3f4f6' }}
                      >
                        {isDarkMode ? (
                          <linearGradient id="barGradientDark" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#60a5fa" />
                            <stop offset="100%" stopColor="#818cf8" />
                          </linearGradient>
                        ) : (
                          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#6366f1" />
                          </linearGradient>
                        )}
                        <stop offset="0%" stopColor={isDarkMode ? "#60a5fa" : "#3b82f6"} />
                        <stop offset="100%" stopColor={isDarkMode ? "#818cf8" : "#6366f1"} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
