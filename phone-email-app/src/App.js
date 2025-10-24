import React, { useState } from 'react';
import { Mail, Upload, CheckCircle, X, Sun, Moon } from 'lucide-react';

export default function PhotoEmailer() {
  const [email, setEmail] = useState('');
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState(''); // 'sending', 'success', 'error'
  const [message, setMessage] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
      setStatus('');
      setMessage('');
    }
  };

  const handleSubmit = async () => {
    if (!email || !photo) {
      setStatus('error');
      setMessage('Please provide both an email address and a photo.');
      return;
    }

    setStatus('sending');
    setMessage('Sending your photo...');

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('photo', photo);

      // 🔗 Smart API URL handling: uses deployed backend if available
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/send-email`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(result.message || `Photo sent to ${email}! Check your inbox.`);
      } else {
        throw new Error(result.error || 'Failed to send email');
      }

      // Reset form after success
      setTimeout(() => {
        setPhoto(null);
        setPreview(null);
        setEmail('');
        setStatus('');
        setMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error sending photo:', error);
      setStatus('error');
      setMessage('Failed to send email. Please try again later.');
    }
  };

  const clearPhoto = () => {
    setPhoto(null);
    setPreview(null);
    setStatus('');
    setMessage('');
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 transition-colors ${
        darkMode
          ? 'bg-gradient-to-br from-gray-900 to-gray-800'
          : 'bg-gradient-to-br from-blue-50 to-indigo-100'
      }`}
    >
      <button
        onClick={() => setDarkMode(!darkMode)}
        className={`fixed top-4 right-4 p-3 rounded-full transition-colors ${
          darkMode
            ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600'
            : 'bg-white text-gray-700 hover:bg-gray-100'
        } shadow-lg`}
      >
        {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
      </button>

      <div
        className={`rounded-2xl shadow-xl p-8 w-full max-w-md transition-colors ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        <div className="text-center mb-8">
          <div
            className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
              darkMode ? 'bg-indigo-900' : 'bg-indigo-100'
            }`}
          >
            <Mail
              className={`w-8 h-8 ${
                darkMode ? 'text-indigo-400' : 'text-indigo-600'
              }`}
            />
          </div>
          <h1
            className={`text-3xl font-bold mb-2 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}
          >
            Email My Photo
          </h1>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            Upload a photo and email it to yourself
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className={`block text-lg font-medium mb-2 ${
                darkMode ? 'text-gray-200' : 'text-gray-700'
              }`}
            >
              Your Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 text-lg border-2 rounded-lg outline-none transition-colors ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label
              className={`block text-lg font-medium mb-2 ${
                darkMode ? 'text-gray-200' : 'text-gray-700'
              }`}
            >
              Your Photo
            </label>

            {!preview ? (
              <label
                className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  darkMode
                    ? 'border-gray-600 hover:border-indigo-500 hover:bg-gray-700'
                    : 'border-gray-300 hover:border-indigo-500 hover:bg-indigo-50'
                }`}
              >
                <Upload
                  className={`w-12 h-12 mb-2 ${
                    darkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}
                />
                <span
                  className={`text-lg ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  Click to upload photo
                </span>
                <span
                  className={`text-sm mt-1 ${
                    darkMode ? 'text-gray-500' : 'text-gray-500'
                  }`}
                >
                  JPG, PNG, or HEIC
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
              </label>
            ) : (
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={clearPhoto}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {message && (
            <div
              className={`p-4 rounded-lg flex items-center gap-3 ${
                status === 'success'
                  ? 'bg-green-100 text-green-800'
                  : status === 'error'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {status === 'success' && <CheckCircle className="w-5 h-5" />}
              <span className="text-sm font-medium">{message}</span>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={status === 'sending' || status === 'success'}
            className="w-full bg-indigo-600 text-white py-4 px-6 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Mail className="w-5 h-5" />
            {status === 'sending' ? 'Sending...' : 'Email This Photo to Me'}
          </button>
        </div>

        <p
          className={`text-center text-sm mt-6 ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}
        >
          The photo will be sent to your email address so you can forward it to
          anyone.
        </p>
      </div>
    </div>
  );
}
