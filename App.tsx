import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  CalendarClock, 
  CircleDollarSign, 
  GitMerge, 
  FileText, 
  ChevronRight, 
  Loader2,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  AlertOctagon,
  ArrowRight,
  Settings,
  Moon,
  Sun,
  Camera,
  User,
  X
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  ComposedChart,
  Area
} from 'recharts';

import { FileUploader } from './components/FileUploader';
import { analyzeProjectPerformance } from './services/geminiService';
import { AppMode, FileCategory, FileType, ProjectFile, AnalysisResult } from './types';

// -- Helper Components --

interface SidebarItemProps {
  icon: any;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  icon: Icon, 
  label, 
  isActive, 
  onClick 
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-lg mb-1
      ${isActive 
        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
      }`}
  >
    <Icon size={20} />
    {label}
    {isActive && <ChevronRight size={16} className="ml-auto" />}
  </button>
);

interface MetricCardProps {
  label: string;
  value: string | number;
  status: string;
  subtext?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, status, subtext }) => {
  // Styles for Dark Mode included
  const statusStyles = 
    status === 'good' ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
    status === 'warning' ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' :
    status === 'critical' ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
    'text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700';

  // Extract color for title separately if needed, but using inherited logic mostly
  const titleColor = status === 'neutral' ? 'text-slate-900 dark:text-white' : statusStyles.split(' ')[0];

  return (
    <div className={`p-4 rounded-xl border shadow-sm transition-colors ${statusStyles.split(' ').slice(2).join(' ')}`}>
      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">{label}</p>
      <div className="flex items-end gap-2">
        <h3 className={`text-2xl font-bold ${titleColor}`}>{value}</h3>
      </div>
       {subtext && <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{subtext}</p>}
    </div>
  );
};

// -- Settings Modal Component --
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: { name: string; avatar: string | null };
  onUpdateProfile: (name: string, avatar: string | null) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, onClose, userProfile, onUpdateProfile, isDarkMode, onToggleTheme 
}) => {
  const [name, setName] = useState(userProfile.name);
  const [avatar, setAvatar] = useState(userProfile.avatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(userProfile.name);
      setAvatar(userProfile.avatar);
    }
  }, [isOpen, userProfile]);

  const handleSave = () => {
    onUpdateProfile(name, avatar);
    onClose();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatar(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-850 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings size={18} className="text-slate-400" />
            User Settings
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-100 dark:border-slate-700 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                {avatar ? (
                  <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={40} />
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white" size={24} />
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Click to upload photo</p>
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Display Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-md ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-orange-100 text-orange-600'}`}>
                {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Interface Theme</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</p>
              </div>
            </div>
            <button 
              onClick={onToggleTheme}
              role="switch"
              aria-checked={isDarkMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${isDarkMode ? 'bg-blue-600' : 'bg-slate-200'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [currentMode, setCurrentMode] = useState<AppMode>(AppMode.DASHBOARD);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // User & Theme State
  const [userProfile, setUserProfile] = useState({ name: "Project Manager", avatar: null as string | null });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Initialize theme from localStorage or system preference
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Handle Theme Change and Persistence
  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // -- Handlers --

  const handleFileUpload = (file: File, type: FileType) => {
    const category = [FileType.SCHEDULE_BASELINE, FileType.PROJECT_SCHEDULE_ACTUALS, FileType.WORK_PERFORMANCE_DATA].includes(type)
      ? FileCategory.SCHEDULE
      : FileCategory.FINANCIAL;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const base64Data = result.split(',')[1];

      const newFile: ProjectFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type,
        category,
        uploadDate: new Date(),
        size: file.size,
        base64Data: base64Data,
        mimeType: file.type
      };

      setFiles(prev => [...prev.filter(f => f.type !== type), newFile]);
    };
    reader.readAsDataURL(file);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const runAnalysis = async () => {
    if (files.length === 0) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    setTimeout(async () => {
      const result = await analyzeProjectPerformance(currentMode, files);
      setAnalysisResult(result);
      setIsAnalyzing(false);
    }, 100);
  };

  // Recharts theme colors
  const chartColors = {
    grid: isDarkMode ? '#334155' : '#e2e8f0',
    text: isDarkMode ? '#94a3b8' : '#64748b',
    tooltipBg: isDarkMode ? '#1e293b' : '#fff',
    tooltipBorder: isDarkMode ? '#475569' : '#e2e8f0',
  };

  // -- Views --

  const renderDashboard = () => (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Project Command Center</h1>
        <p className="text-slate-500 dark:text-slate-400">Overview of project artifacts and system readiness.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm col-span-2 transition-colors">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <FileText size={20} className="text-blue-500 dark:text-blue-400"/> Recent Uploads
          </h3>
          <div className="overflow-hidden">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3 font-medium">Document Name</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {files.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-400 dark:text-slate-500">
                      No files uploaded yet. Navigate to control modules to add data.
                    </td>
                  </tr>
                ) : (
                  files.map(file => (
                    <tr key={file.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">{file.name}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{file.type}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{file.uploadDate.toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
                          <CheckCircle2 size={12} /> Active
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-blue-900 dark:bg-blue-950 text-white p-6 rounded-xl shadow-lg flex flex-col justify-between border border-blue-800 dark:border-blue-900">
          <div>
            <h3 className="text-lg font-semibold mb-2">System Status</h3>
            <p className="text-blue-200 text-sm mb-6">PMBOK 8th Edition Control Modules are online.</p>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span>Schedule Data</span>
                <span className={files.some(f => f.category === FileCategory.SCHEDULE) ? "text-green-400 font-bold" : "text-blue-300"}>
                  {files.some(f => f.category === FileCategory.SCHEDULE) ? "Ready" : "Pending"}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Financial Data</span>
                <span className={files.some(f => f.category === FileCategory.FINANCIAL) ? "text-green-400 font-bold" : "text-blue-300"}>
                  {files.some(f => f.category === FileCategory.FINANCIAL) ? "Ready" : "Pending"}
                </span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => setCurrentMode(AppMode.SCHEDULE_CONTROL)}
            className="w-full bg-blue-600 hover:bg-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600 text-white py-2 rounded-lg text-sm font-medium transition-colors mt-6"
          >
            Start Analysis
          </button>
        </div>
      </div>
    </div>
  );

  const renderAnalysisView = (title: string, description: string, acceptedFiles: FileType[]) => {
    const relevantFileTypes = acceptedFiles;
    
    return (
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full">
        {/* Left Column: Input & Context */}
        <div className="xl:col-span-1 space-y-6">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{description}</p>
          </header>

          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-4">Project Data Intake</h3>
            <div className="space-y-3">
              {relevantFileTypes.map(type => (
                <FileUploader
                  key={type}
                  label={type}
                  acceptTypes={[type]}
                  currentFile={files.find(f => f.type === type)}
                  onUpload={handleFileUpload}
                  onRemove={() => {
                    const f = files.find(f => f.type === type);
                    if (f) removeFile(f.id);
                  }}
                />
              ))}
            </div>
          </div>

          <button
            onClick={runAnalysis}
            disabled={isAnalyzing || files.length === 0}
            className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold text-white shadow-md transition-all
              ${isAnalyzing || files.length === 0 
                ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 hover:shadow-lg transform hover:-translate-y-0.5'
              }`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="animate-spin" size={20} /> Analyzing...
              </>
            ) : (
              <>
                <TrendingUp size={20} /> Generate Analysis
              </>
            )}
          </button>
        </div>

        {/* Right Column: Output */}
        <div className="xl:col-span-2 space-y-6">
          {!analysisResult ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-12 transition-colors">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-full shadow-sm mb-4">
                <BarChart className="text-slate-300 dark:text-slate-600" size={48} />
              </div>
              <p className="text-lg font-medium text-slate-500 dark:text-slate-400">Awaiting Analysis</p>
              <p className="text-sm">Upload required files and click "Generate Analysis" to begin.</p>
            </div>
          ) : (
            <>
              {/* Executive Summary & Scores */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 <div className="md:col-span-3 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
                    <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">Executive Summary</h3>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{analysisResult.executiveSummary}</p>
                 </div>
                 <div className="md:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center text-center transition-colors">
                    <div className="relative w-20 h-20 flex items-center justify-center mb-2">
                      <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path
                          className="text-slate-100 dark:text-slate-700"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        />
                        <path
                          className={`${analysisResult.dataReadinessScore > 80 ? 'text-green-500' : 'text-amber-500'}`}
                          strokeDasharray={`${analysisResult.dataReadinessScore}, 100`}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        />
                      </svg>
                      <span className="absolute text-xl font-bold text-slate-700 dark:text-slate-200">{analysisResult.dataReadinessScore}%</span>
                    </div>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Data Readiness</span>
                 </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {analysisResult.metrics.map((m, idx) => (
                  <MetricCard key={idx} label={m.label} value={m.value} status={m.status} subtext={m.trend ? `Trend: ${m.trend}` : undefined} />
                ))}
              </div>

              {/* Charts */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm h-80 transition-colors">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">Performance Trends</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={analysisResult.chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.grid} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: chartColors.text, fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: chartColors.text, fontSize: 12}} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: chartColors.tooltipBg, 
                        borderRadius: '8px', 
                        border: `1px solid ${chartColors.tooltipBorder}`, 
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                      itemStyle={{ color: isDarkMode ? '#e2e8f0' : '#1e293b' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }}/>
                    <Area type="monotone" dataKey="planned" stackId="1" stroke="#94a3b8" fill="#f1f5f9" fillOpacity={isDarkMode ? 0.2 : 1} />
                    <Bar dataKey="actual" barSize={20} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Line type="monotone" dataKey="forecast" stroke="#f59e0b" strokeWidth={2} dot={{r: 4}} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Recommendations & Change Requests */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-green-600 dark:text-green-500"/> Corrective Actions
                  </h3>
                  <ul className="space-y-3">
                    {analysisResult.recommendations.map((rec, i) => (
                      <li key={i} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
                        <span className="text-blue-500 dark:text-blue-400 font-bold">{i+1}.</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                    <AlertOctagon size={16} className="text-red-500 dark:text-red-400"/> Recommended Change Requests
                  </h3>
                  {analysisResult.changeRequests.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400 italic">No change requests triggered by current analysis.</p>
                  ) : (
                    <div className="space-y-3">
                      {analysisResult.changeRequests.map((cr, i) => (
                        <div key={i} className="border border-slate-100 dark:border-slate-700 rounded-lg p-3 hover:border-red-200 dark:hover:border-red-800 transition-colors">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">{cr.title}</span>
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full
                              ${cr.priority === 'High' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'}`}>
                              {cr.priority}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{cr.reason}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        userProfile={userProfile}
        onUpdateProfile={(name, avatar) => setUserProfile({ name, avatar })}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-850 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-colors">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-500 font-bold text-xl">
            <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center text-white">
              <GitMerge size={20} />
            </div>
            PMIS<span className="text-slate-400 font-normal">.AI</span>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="mb-6">
            <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-4">Overview</h4>
            <SidebarItem 
              icon={LayoutDashboard} 
              label="Dashboard" 
              isActive={currentMode === AppMode.DASHBOARD}
              onClick={() => setCurrentMode(AppMode.DASHBOARD)} 
            />
          </div>

          <div className="mb-6">
            <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-4">Control Modules</h4>
            <SidebarItem 
              icon={CalendarClock} 
              label="Schedule Control" 
              isActive={currentMode === AppMode.SCHEDULE_CONTROL}
              onClick={() => setCurrentMode(AppMode.SCHEDULE_CONTROL)} 
            />
            <SidebarItem 
              icon={CircleDollarSign} 
              label="Financial Control" 
              isActive={currentMode === AppMode.FINANCIAL_CONTROL}
              onClick={() => setCurrentMode(AppMode.FINANCIAL_CONTROL)} 
            />
            <SidebarItem 
              icon={AlertTriangle} 
              label="Integrated Control" 
              isActive={currentMode === AppMode.INTEGRATED_CONTROL}
              onClick={() => setCurrentMode(AppMode.INTEGRATED_CONTROL)} 
            />
          </div>
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <div 
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
          >
             <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-xs font-bold overflow-hidden border border-indigo-200 dark:border-indigo-800">
               {userProfile.avatar ? (
                 <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
               ) : (
                 userProfile.name.charAt(0)
               )}
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-sm font-medium text-slate-900 dark:text-slate-200 truncate">{userProfile.name}</p>
               <p className="text-xs text-slate-500 dark:text-slate-400">Admin Access</p>
             </div>
             <Settings size={14} className="text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto h-full">
          {currentMode === AppMode.DASHBOARD && renderDashboard()}
          {currentMode === AppMode.SCHEDULE_CONTROL && renderAnalysisView(
            "Schedule Control (3.3)",
            "Compare actual progress against approved baselines to forecast completion.",
            [FileType.SCHEDULE_BASELINE, FileType.PROJECT_SCHEDULE_ACTUALS, FileType.WORK_PERFORMANCE_DATA]
          )}
          {currentMode === AppMode.FINANCIAL_CONTROL && renderAnalysisView(
            "Financial Control (4.4)",
            "Monitor cost variances, analyze Earned Value, and manage reserves.",
            [FileType.COST_BASELINE, FileType.ACTUAL_COST_REPORT, FileType.FINANCIAL_PLAN]
          )}
          {currentMode === AppMode.INTEGRATED_CONTROL && renderAnalysisView(
            "Integrated Control",
            "Deep analysis of schedule delays impacts on cost and funding requirements.",
            [FileType.SCHEDULE_BASELINE, FileType.COST_BASELINE, FileType.PROJECT_SCHEDULE_ACTUALS, FileType.ACTUAL_COST_REPORT]
          )}
        </div>
      </main>
    </div>
  );
}