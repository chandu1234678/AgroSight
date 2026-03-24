import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SideNavBar from '../components/SideNavBar';
import TopAppBar from '../components/TopAppBar';
import BottomNavBar from '../components/BottomNavBar';
import { scanAPI } from '../services/api';

const ScanPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileSelect = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setError('');

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await scanAPI.upload(formData);
      const result = response.data;

      // Navigate to results — pass data via state so no extra fetch needed
      if (result.id) {
        navigate(`/scan/${result.id}`, { state: { result } });
      } else {
        navigate('/scan/results', { state: { result } });
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-background antialiased selection:bg-primary/30">
      <SideNavBar />
      <div className="md:ml-64 min-h-screen">
        <TopAppBar title="Scan Plant" />
        
        <main className="p-6 md:p-10 max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface mb-4">
              Plant Disease Detection
            </h1>
            <p className="text-on-surface-variant text-lg leading-relaxed">
              Upload a clear image of your plant's leaves to instantly identify pests, diseases, and nutrient deficiencies with our neural engine.
            </p>
          </div>

          {/* Upload Area */}
          <div className="space-y-6">
            {!preview ? (
              <div
                className={`relative border-2 border-dashed rounded-2xl p-12 transition-all ${
                  dragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-outline-variant hover:border-primary/50 bg-surface-container-low'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                <div className="text-center space-y-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
                    <span className="material-symbols-outlined text-primary text-5xl">add_a_photo</span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-on-surface mb-2">
                      Drop your plant image here
                    </h3>
                    <p className="text-on-surface-variant text-sm">
                      or click to browse from your device
                    </p>
                  </div>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold px-8 py-4 rounded-md hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/10"
                  >
                    Select Image
                  </button>

                  <div className="flex items-center justify-center gap-8 pt-6 border-t border-outline-variant/20">
                    <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                      <span className="material-symbols-outlined text-lg">check_circle</span>
                      JPG, PNG, WEBP
                    </div>
                    <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                      <span className="material-symbols-outlined text-lg">check_circle</span>
                      Max 10MB
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Preview */}
                <div className="relative bg-surface-container-low rounded-2xl overflow-hidden">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-auto max-h-[500px] object-contain"
                  />
                  <button
                    onClick={handleReset}
                    className="absolute top-4 right-4 bg-surface-container-highest/90 backdrop-blur-sm text-on-surface p-3 rounded-full hover:bg-error hover:text-on-error transition-all shadow-lg"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                {/* File Info */}
                <div className="bg-surface-container-highest rounded-xl p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary">image</span>
                    </div>
                    <div>
                      <p className="font-bold text-on-surface">{selectedFile?.name}</p>
                      <p className="text-sm text-on-surface-variant">
                        {(selectedFile?.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleReset}
                    className="text-on-surface-variant hover:text-error transition-colors"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>

                {/* Analyze Button */}
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold py-5 rounded-md hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">auto_awesome</span>
                      Begin AI Analysis
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-error-container/20 border border-error rounded-lg">
                <p className="text-error text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined">error</span>
                  {error}
                </p>
              </div>
            )}
          </div>

          {/* Tips Section */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface-container-low p-6 rounded-xl">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-primary">wb_sunny</span>
              </div>
              <h4 className="font-bold text-on-surface mb-2">Good Lighting</h4>
              <p className="text-sm text-on-surface-variant">
                Take photos in natural daylight for best results
              </p>
            </div>

            <div className="bg-surface-container-low p-6 rounded-xl">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-primary">center_focus_strong</span>
              </div>
              <h4 className="font-bold text-on-surface mb-2">Clear Focus</h4>
              <p className="text-sm text-on-surface-variant">
                Ensure the affected area is in sharp focus
              </p>
            </div>

            <div className="bg-surface-container-low p-6 rounded-xl">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-primary">crop</span>
              </div>
              <h4 className="font-bold text-on-surface mb-2">Close-Up Shot</h4>
              <p className="text-sm text-on-surface-variant">
                Capture leaves up close to show symptoms clearly
              </p>
            </div>
          </div>
        </main>
      </div>
      <BottomNavBar />
    </div>
  );
};

export default ScanPage;
