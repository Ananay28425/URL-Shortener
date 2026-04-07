import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
  ComposedChart, Line, PieChart, Pie, Legend
} from 'recharts';
import { 
  Link2, Copy, Check, Activity, ArrowRight, Shield, 
  BarChart4, LogIn, Globe, ChevronRight, 
  Trash2, Search, Plus, Menu, X, Terminal, Settings, 
  Database, Sparkles, LayoutDashboard
} from 'lucide-react';

// ============================================================================
// [SERVICES] - API Simulation (Replace with actual Axios calls to your backend)
// ============================================================================
const delay = (ms) => new Promise(res => setTimeout(res, ms));

// Helper to generate realistic-looking random chart data for the demo
const generateRandomAnalytics = () => {
  const times = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59'];
  let totalRequests = 0;
  
  const traffic = times.map(time => {
    const requests = Math.floor(Math.random() * 3000) + 100;
    const unique = Math.floor(requests * (Math.random() * 0.4 + 0.4)); // 40-80% are unique
    totalRequests += requests;
    return { time, requests, unique };
  });

  const remainingGeo = 100;
  const us = Math.floor(Math.random() * 40) + 20;
  const eu = Math.floor(Math.random() * 30) + 10;
  const ind = Math.floor(Math.random() * 20) + 5;
  const other = 100 - us - eu - ind;

  return {
    clicks: totalRequests,
    traffic,
    devices: [
      { name: 'Desktop', value: Math.floor(Math.random() * 60) + 20 },
      { name: 'Mobile', value: Math.floor(Math.random() * 50) + 10 },
      { name: 'Tablet', value: Math.floor(Math.random() * 15) + 5 },
      { name: 'Bot/Unknown', value: Math.floor(Math.random() * 10) + 1 },
    ],
    geo: [
      { name: 'US', value: us }, { name: 'EU', value: eu },
      { name: 'IN', value: ind }, { name: 'OTHER', value: other },
    ]
  };
};

const mockDb = {
  urls: [
    { id: '1', short: 'shrt.dev/e2b-docs', original: 'https://e2b.dev/docs/guide/custom-sandbox', clicks: 12404, status: 'active', created: '2026-03-24T12:00:00Z', analytics: generateRandomAnalytics() },
    { id: '2', short: 'shrt.dev/seq-llm', original: 'https://sequence-llm-website.vercel.app/pricing', clicks: 8432, status: 'active', created: '2026-03-25T08:30:00Z', analytics: generateRandomAnalytics() },
    { id: '3', short: 'shrt.dev/recharts', original: 'https://recharts.github.io/en-US/examples', clicks: 312, status: 'inactive', created: '2026-03-26T15:45:00Z', analytics: generateRandomAnalytics() },
  ]
};

const api = {
  shorten: async (url, alias, onLog) => {
    onLog('Initiating link creation...');
    await delay(400);
    if (!url.startsWith('http')) {
      onLog('ERR: Invalid protocol. HTTP/HTTPS required.', 'error');
      throw new Error('Invalid URL format');
    }
    onLog(`Validating destination: ${new URL(url).hostname}...`);
    await delay(500);
    onLog('Generating cryptographic alias...');
    await delay(300);
    
    const generatedAnalytics = generateRandomAnalytics();
    
    const newUrl = {
      id: Math.random().toString(36).substr(2, 9),
      short: alias ? `shrt.dev/${alias}` : `shrt.dev/${Math.random().toString(36).substr(2, 5)}`,
      original: url,
      clicks: generatedAnalytics.clicks,
      status: 'active',
      created: new Date().toISOString(),
      analytics: generatedAnalytics
    };
    mockDb.urls.unshift(newUrl);
    
    onLog(`SUCCESS: Route established at ${newUrl.short}`, 'success');
    return newUrl;
  },
  getUrls: async () => {
    await delay(400);
    return [...mockDb.urls];
  },
  deleteUrl: async (id) => {
    await delay(300);
    mockDb.urls = mockDb.urls.filter(u => u.id !== id);
    return true;
  },
  getAnalytics: async (id) => {
    await delay(500);
    const url = mockDb.urls.find(u => u.id === id);
    if (!url) throw new Error('URL not found');
    return { 
      url, 
      traffic: url.analytics.traffic, 
      devices: url.analytics.devices, 
      geo: url.analytics.geo 
    };
  },
  // Simulate calling your Python/Node backend which holds the Gemini API key
  generateSmartAlias: async (url) => {
    await delay(1200);
    if (!url) throw new Error('URL required');
    return `ai-${Math.random().toString(36).substr(2, 4)}`; 
  },
  getAiInsight: async (data) => {
    await delay(1500);
    return `REPORT: Traffic volume hit ${data.traffic.reduce((a,b)=>a+b.requests,0)} total requests. Desktop environments represent the primary client hardware. Geographic routing shows major packet flow from ${data.geo.sort((a,b)=>b.value - a.value)[0].name} nodes. Operation nominal.`;
  }
};

// ============================================================================
// [UTILS]
// ============================================================================
const formatDate = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// ============================================================================
// [COMPONENTS]
// ============================================================================
const Card = ({ children, className = '' }) => (
  <div className={`bg-[#111111] border border-[#333333] rounded-md ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = 'primary', className = '', disabled, loading, type = 'button' }) => {
  const base = "px-4 py-2 rounded-md font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm";
  const variants = {
    primary: "bg-[#F38020] hover:bg-[#d9731c] text-black border border-[#F38020]",
    secondary: "bg-[#222] hover:bg-[#333] text-white border border-[#444]",
    ghost: "bg-transparent hover:bg-[#222] text-neutral-400 hover:text-white"
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} className={`${base} ${variants[variant]} ${className}`}>
      {loading ? <Activity size={16} className="animate-spin" /> : children}
    </button>
  );
};

const Input = ({ label, ...props }) => (
  <div className="flex flex-col gap-1.5 w-full">
    {label && <label className="text-xs font-mono text-neutral-400 uppercase tracking-wider">{label}</label>}
    <input 
      {...props} 
      className={`bg-[#000000] border border-[#333333] text-white px-3 py-2 rounded-md focus:outline-none focus:border-[#F38020] transition-colors w-full font-mono text-sm placeholder-neutral-600 ${props.className}`} 
    />
  </div>
);

// ============================================================================
// [PAGES]
// ============================================================================

const HomePage = ({ navigate }) => {
  const [url, setUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatingAlias, setGeneratingAlias] = useState(false);
  const [result, setResult] = useState(null);
  const [logs, setLogs] = useState([{ text: 'System ready. Awaiting input...', type: 'info' }]);
  const [copied, setCopied] = useState(false);

  const appendLog = (text, type = 'info') => {
    setLogs(prev => [...prev, { text, type, time: new Date().toISOString().substring(11, 23) }]);
  };

  const handleGenerateAlias = async () => {
    if (!url) {
      appendLog('ERR: Target URL required for AI generation.', 'error');
      return;
    }
    setGeneratingAlias(true);
    appendLog('Requesting smart alias from backend LLM service...');
    try {
      const aiAlias = await api.generateSmartAlias(url);
      setAlias(aiAlias);
      appendLog(`SUCCESS: Backend generated alias '${aiAlias}'`, 'success');
    } catch (err) {
      appendLog('ERR: AI service unresponsive.', 'error');
    } finally {
      setGeneratingAlias(false);
    }
  };

  const handleShorten = async (e) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true); setResult(null); setLogs([]);
    try {
      const res = await api.shorten(url, alias, appendLog);
      setResult(res.short);
    } catch (err) {
      // Error handled in API mock logger
    } finally {
      setLoading(false);
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(result);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-48px)] bg-[#000000] animate-in fade-in duration-500">
      
      {/* Left Pane - Configuration (Product Focus) */}
      <div className="w-full md:w-1/2 border-r border-[#333333] flex flex-col">
        <div className="bg-[#111111] px-4 py-2 border-b border-[#333333] flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-neutral-300 font-mono">
            <Settings size={14} /> Link_Configuration
          </div>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-white mb-2">Create Short Link</h1>
            <p className="text-sm text-neutral-500">Route traffic securely with real-time analytics tracking.</p>
          </div>

          <form onSubmit={handleShorten} className="space-y-6">
            <Input 
              label="Destination URL" 
              type="url" required
              placeholder="https://example.com/very/long/path"
              value={url} onChange={e => setUrl(e.target.value)}
            />
            
            <div>
              <label className="text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1.5 block">Custom Alias (Optional)</label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="my-campaign"
                  value={alias} onChange={e => setAlias(e.target.value)}
                  className="bg-[#000000] border border-[#333333] text-white px-3 py-2 rounded-md focus:outline-none focus:border-[#F38020] transition-colors flex-1 font-mono text-sm placeholder-neutral-600"
                />
                <Button 
                  variant="secondary" 
                  onClick={handleGenerateAlias} 
                  loading={generatingAlias}
                  className="border-[#F38020] text-[#F38020] hover:bg-[#F38020] hover:text-black transition-colors"
                  title="Generate smart alias with backend AI"
                >
                  <Sparkles size={16} /> Auto
                </Button>
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full">
              {loading ? 'Processing...' : 'Create Link'} <ArrowRight size={16} />
            </Button>
          </form>
        </div>
      </div>

      {/* Right Pane - System Logs (Terminal Focus) */}
      <div className="w-full md:w-1/2 flex flex-col bg-[#050505]">
        <div className="bg-[#111111] px-4 py-2 border-b border-[#333333] flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-neutral-300 font-mono">
            <Terminal size={14} /> System_Logs
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-mono text-neutral-500">Live</span>
          </div>
        </div>

        <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-1">
          {logs.map((log, i) => (
            <div key={i} className="flex gap-4 hover:bg-[#111] px-2 py-1 rounded">
              <span className="text-neutral-600 select-none">[{log.time || '00:00:00.00'}]</span>
              <span className={`
                ${log.type === 'error' ? 'text-red-400 font-bold' : 
                  log.type === 'success' ? 'text-[#F38020] font-bold' : 
                  'text-neutral-300'}
              `}>
                {log.text}
              </span>
            </div>
          ))}
          
          {result && (
            <div className="mt-4 p-4 border border-[#F38020]/30 bg-[#F38020]/5 rounded-md animate-in slide-in-from-bottom-2">
              <div className="text-neutral-400 mb-2 uppercase tracking-wider">&gt;&gt; Link_Generated:</div>
              <div className="flex items-center justify-between">
                <span className="text-[#F38020] text-lg font-bold">{result}</span>
                <Button variant="secondary" onClick={copyUrl} className="py-1 px-3">
                  {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DashboardPage = ({ navigate }) => {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.getUrls().then(data => { setUrls(data); setLoading(false); });
  }, []);

  const handleDelete = async (id) => {
    await api.deleteUrl(id);
    setUrls(urls.filter(u => u.id !== id));
  };

  const filteredUrls = urls.filter(u => u.short.includes(search) || u.original.includes(search));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Analytics Dashboard</h1>
          <p className="text-sm text-neutral-400 mt-1">Monitor performance and manage active URLs.</p>
        </div>
        <Button onClick={() => navigate('home')}><Plus size={16} /> New Link</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Links', value: urls.length },
          { label: 'Total Clicks', value: urls.reduce((acc, u) => acc + u.clicks, 0).toLocaleString() },
          { label: 'Active URLs', value: urls.filter(u=>u.status==='active').length, color: 'text-green-500' },
          { label: 'Top Link Clicks', value: urls.length ? Math.max(...urls.map(u => u.clicks)).toLocaleString() : '0', color: 'text-[#F38020]' }
        ].map((stat, i) => (
          <Card key={i} className="p-4 border-[#333]">
            <p className="text-xs font-mono text-neutral-500 uppercase tracking-wider mb-1">{stat.label}</p>
            <p className={`text-xl font-mono ${stat.color || 'text-white'}`}>{stat.value}</p>
          </Card>
        ))}
      </div>

      <Card className="p-0 overflow-hidden border-[#333]">
        <div className="p-3 border-b border-[#333] flex items-center gap-3 bg-[#111]">
          <Search size={16} className="text-neutral-500" />
          <input 
            type="text" placeholder="Search by alias or original URL..." 
            value={search} onChange={e => setSearch(e.target.value)}
            className="bg-transparent border-none text-white focus:outline-none w-full text-sm font-mono placeholder-neutral-600"
          />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-300">
            <thead className="bg-[#050505] text-neutral-500 border-b border-[#333] font-mono text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 font-medium">Short Link</th>
                <th className="px-4 py-3 font-medium">Original URL</th>
                <th className="px-4 py-3 font-medium">Clicks</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222] bg-[#0A0A0A]">
              {loading ? (
                <tr><td colSpan="5" className="px-4 py-8 text-center text-neutral-500 font-mono">Syncing telemetry data...</td></tr>
              ) : filteredUrls.length === 0 ? (
                <tr><td colSpan="5" className="px-4 py-8 text-center text-neutral-500 font-mono">No links found.</td></tr>
              ) : (
                filteredUrls.map((url) => (
                  <tr key={url.id} className="hover:bg-[#111] transition-colors group">
                    <td className="px-4 py-3 font-mono text-white flex items-center gap-2">
                      {url.short}
                    </td>
                    <td className="px-4 py-3 max-w-[300px] truncate text-neutral-400 text-xs">{url.original}</td>
                    <td className="px-4 py-3 font-mono text-[#F38020]">{url.clicks.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono ${url.status === 'active' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-neutral-800 text-neutral-400 border border-neutral-700'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${url.status === 'active' ? 'bg-green-500' : 'bg-neutral-500'}`}></div>
                        {url.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" className="p-1.5" onClick={() => navigator.clipboard.writeText(url.short)}><Copy size={14}/></Button>
                        <Button variant="ghost" className="p-1.5 text-neutral-300 hover:text-[#F38020]" onClick={() => navigate('analytics', { id: url.id })}><BarChart4 size={14}/></Button>
                        <Button variant="ghost" className="p-1.5 hover:text-red-500" onClick={() => handleDelete(url.id)}><Trash2 size={14}/></Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const AnalyticsPage = ({ navigate, params }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [insight, setInsight] = useState('');
  const [loadingInsight, setLoadingInsight] = useState(false);

  useEffect(() => {
    if (params.id) {
      api.getAnalytics(params.id).then(res => { setData(res); setLoading(false); }).catch(() => navigate('dashboard'));
    }
  }, [params.id]);

  const handleGenerateInsight = async () => {
    setLoadingInsight(true);
    try {
      const result = await api.getAiInsight(data);
      setInsight(result);
    } catch (err) {
      setInsight("ERR: Telemetry analysis failed. Backend service unresponsive.");
    } finally {
      setLoadingInsight(false);
    }
  };

  if (loading) return <div className="flex justify-center py-32"><Activity className="animate-spin text-[#F38020]" size={32} /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in">
      <button onClick={() => navigate('dashboard')} className="flex items-center gap-1.5 text-neutral-400 hover:text-white mb-6 text-sm font-mono transition-colors">
        <ChevronRight size={14} className="rotate-180" /> Dashboard
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-[#111] p-6 rounded-md border border-[#333]">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-white font-mono">{data.url.short}</h1>
            <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-500 border border-green-500/20 text-xs font-mono uppercase">Active</span>
          </div>
          <p className="text-neutral-400 text-sm flex items-center gap-2 max-w-xl truncate"><ArrowRight size={14}/> {data.url.original}</p>
        </div>
        <Button variant="secondary" onClick={() => navigator.clipboard.writeText(data.url.short)}>
          <Copy size={14} /> Copy Route
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        
        {/* Composed Chart - Clicks / Unique */}
        <Card className="lg:col-span-3 p-6 border-[#333]">
          <div className="mb-6 flex justify-between items-center">
            <h3 className="text-neutral-300 font-semibold font-mono uppercase tracking-wider text-sm">Traffic Volume (24H)</h3>
            <span className="text-[#F38020] font-mono font-bold text-lg">TTL REQ: {data.traffic.reduce((a,b)=>a+b.requests,0).toLocaleString()}</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data.traffic} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOrange" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F38020" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#F38020" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="time" stroke="#666" fontSize={12} tickLine={false} axisLine={false} fontFamily="monospace" />
                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} fontFamily="monospace" />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '4px', color: '#fff', fontFamily: 'monospace' }}
                  cursor={{ stroke: '#444' }}
                />
                <Legend verticalAlign="top" height={36} iconType="square" wrapperStyle={{ fontFamily: 'monospace', fontSize: '12px', color: '#ccc' }} />
                <Area type="monotone" name="Total Requests" dataKey="requests" stroke="#F38020" strokeWidth={2} fillOpacity={1} fill="url(#colorOrange)" />
                <Line type="monotone" name="Unique Visitors" dataKey="unique" stroke="#fff" strokeWidth={2} dot={{ r: 3, fill: '#111', strokeWidth: 2 }} activeDot={{ r: 5 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Device Donut Chart */}
        <Card className="lg:col-span-2 p-6 border-[#333]">
          <h3 className="text-neutral-300 font-semibold mb-6 font-mono uppercase tracking-wider text-sm">Client Hardware</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.devices} cx="50%" cy="50%"
                  innerRadius={70} outerRadius={100}
                  paddingAngle={2} dataKey="value" stroke="none"
                >
                  {data.devices.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#F38020', '#A0522D', '#555', '#222'][index % 4]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '4px', fontFamily: 'monospace' }} itemStyle={{ color: '#fff' }} />
                <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{ fontFamily: 'monospace', fontSize: '12px' }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Geo Bar Chart */}
        <Card className="p-6 border-[#333]">
          <h3 className="text-neutral-300 font-semibold mb-6 font-mono uppercase tracking-wider text-sm">Geo Routing</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.geo} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#999" fontSize={12} tickLine={false} axisLine={false} width={40} fontFamily="monospace" />
                <RechartsTooltip cursor={{ fill: '#1a1a1a' }} contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '4px', fontFamily: 'monospace' }} />
                <Bar dataKey="value" radius={[0, 2, 2, 0]} barSize={20}>
                  {data.geo.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#F38020' : '#444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* AI Insight Section */}
        <Card className="lg:col-span-3 p-6 border-l-2 border-[#F38020]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-semibold font-mono uppercase tracking-wider text-sm flex items-center gap-2">
              <Sparkles size={16} className="text-[#F38020]" /> AI Telemetry Insight
            </h3>
            {!insight && (
              <Button onClick={handleGenerateInsight} loading={loadingInsight} variant="secondary" className="border-[#F38020] text-[#F38020] py-1.5">
                 Run Diagnostic
              </Button>
            )}
          </div>
          <div className="bg-[#050505] p-4 rounded border border-[#333] min-h-[60px] font-mono text-sm text-neutral-400">
            {loadingInsight ? (
              <span className="flex items-center gap-2 animate-pulse text-[#F38020]">
                <Activity size={14} className="animate-spin" /> Querying backend LLM service...
              </span>
            ) : insight ? (
              <span className="text-neutral-200">{insight}</span>
            ) : (
              "Awaiting manual trigger for AI analysis."
            )}
          </div>
        </Card>

      </div>
    </div>
  );
};

const LoginPage = ({ navigate }) => (
  <div className="min-h-[calc(100vh-48px)] flex items-center justify-center px-4 bg-[#050505] animate-in fade-in">
    <Card className="w-full max-w-sm p-6 border-[#333] shadow-2xl">
      <div className="flex justify-center mb-6">
         <div className="w-10 h-10 bg-[#F38020] rounded-md flex items-center justify-center text-black font-bold">
            <Shield size={20} strokeWidth={2.5} />
          </div>
      </div>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold text-white">System Access</h2>
        <p className="text-neutral-500 text-sm mt-1 font-mono">Authenticate to manage links.</p>
      </div>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); navigate('dashboard'); }}>
        <Input label="Admin Email" type="email" required placeholder="admin@cf.local" />
        <Input label="Security Token" type="password" required placeholder="••••••••" />
        <Button type="submit" className="w-full mt-2 py-3">Sign In</Button>
      </form>
    </Card>
  </div>
);

// ============================================================================
// [APP LAYOUT & ROUTER]
// ============================================================================
export default function App() {
  // NOTE: This state-based routing is strictly for the sandbox preview.
  // In your real codebase, replace this with `react-router-dom`.
  const [route, setRoute] = useState({ page: 'home', params: {} });

  const navigate = (page, params = {}) => {
    setRoute({ page, params });
    window.scrollTo(0,0);
  };

  const renderPage = () => {
    switch (route.page) {
      case 'home': return <HomePage navigate={navigate} />;
      case 'dashboard': return <DashboardPage navigate={navigate} />;
      case 'analytics': return <AnalyticsPage navigate={navigate} params={route.params} />;
      case 'login': return <LoginPage navigate={navigate} />;
      default: return <HomePage navigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-neutral-300 font-sans selection:bg-[#F38020]/30 flex flex-col">
      {/* Topbar - Dense Dev-Tool Style */}
      <header className="h-12 bg-[#111111] border-b border-[#333333] flex items-center justify-between px-4 sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('home')}>
            <div className="w-5 h-5 bg-[#F38020] rounded-sm flex items-center justify-center text-black group-hover:scale-105 transition-transform">
              <Database size={12} strokeWidth={3} />
            </div>
            <span className="text-sm font-bold tracking-tight text-white group-hover:text-[#F38020] transition-colors">Shrtnr_Console</span>
          </div>

          <div className="hidden md:flex items-center gap-1 font-mono text-xs uppercase">
            <button onClick={() => navigate('home')} className={`px-3 py-1.5 rounded transition-colors ${route.page === 'home' ? 'bg-[#333] text-white' : 'text-neutral-400 hover:text-white hover:bg-[#222]'}`}>Create</button>
            <button onClick={() => navigate('dashboard')} className={`px-3 py-1.5 rounded transition-colors ${(route.page === 'dashboard' || route.page === 'analytics') ? 'bg-[#333] text-white' : 'text-neutral-400 hover:text-white hover:bg-[#222]'}`}>Analytics</button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-neutral-500 border-r border-[#333] pr-4">
            API Status: <span className="text-green-500">Operational</span>
          </div>
          <button onClick={() => navigate('login')} className="text-xs font-mono text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5">
            <LogIn size={14}/> Sign In
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        {renderPage()}
      </main>
    </div>
  );
}
