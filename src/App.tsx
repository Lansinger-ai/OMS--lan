import React, { useState, useEffect, useRef } from "react";
import { 
  Server, 
  ServerStatus, 
  Accessory, 
  ViewState,
  Feedback
} from "./types";
import { mockServers } from "./mockData";
import { 
  Search, 
  Scan, 
  Package, 
  Settings, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ArrowLeft, 
  MoreVertical, 
  Plus, 
  Minus,
  History,
  ClipboardList,
  Wrench,
  LayoutGrid,
  Box,
  Truck,
  Activity,
  User,
  X,
  Camera,
  Flashlight,
  RefreshCw,
  BarChart2,
  List as ListIcon,
  Server as ServerIcon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [servers, setServers] = useState<Server[]>(mockServers);
  const [view, setView] = useState<ViewState>("LIST");
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"PICKUP" | "OPERATE">("PICKUP");
  const [scanInput, setScanInput] = useState("");
  const [showFeedbackModal, setShowFeedbackModal] = useState<"FAULTY" | "REMOVAL" | null>(null);
  const [feedbackForm, setFeedbackForm] = useState({ name: "", quantity: 1, reason: "" });
  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedServer = servers.find(s => s.id === selectedServerId);

  const addFeedback = (serverId: string, feedback: Omit<Feedback, "id" | "timestamp">) => {
    const newFeedback: Feedback = {
      ...feedback,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    };
    setServers(prev => prev.map(s => 
      s.id === serverId ? { ...s, feedbacks: [...(s.feedbacks || []), newFeedback] } : s
    ));
  };

  // Handle SN Scanning
  const handleScanSuccess = (sn: string) => {
    const server = servers.find(s => s.sn === sn);
    if (server) {
      if (server.status === ServerStatus.PENDING) {
        updateServerStatus(server.id, ServerStatus.RECONFIGURING);
      }
      setSelectedServerId(server.id);
      setView("RECONFIG");
      setIsScanning(false);
    } else {
      // Show error state in scan view
      setScanInput("");
    }
  };

  const updateServerStatus = (id: string, status: ServerStatus) => {
    setServers(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const toggleAccessoryStatus = (serverId: string, accId: string) => {
    setServers(prev => prev.map(s => {
      if (s.id === serverId) {
        return {
          ...s,
          accessories: s.accessories.map(a => 
            a.id === accId ? { ...a, status: a.status === "done" ? "pending" : "done" } : a
          )
        };
      }
      return s;
    }));
  };

  const getStatusColor = (status: ServerStatus) => {
    switch (status) {
      case ServerStatus.PENDING: return "bg-gray-100 text-gray-600 border-gray-200";
      case ServerStatus.RECONFIGURING: return "bg-blue-50 text-blue-600 border-blue-200";
      case ServerStatus.WAITING_FOR_CONFIG: return "bg-yellow-50 text-yellow-600 border-yellow-200";
      case ServerStatus.PENDING_INSPECTION: return "bg-purple-50 text-purple-600 border-purple-200";
      case ServerStatus.INSPECTION_EXCEPTION: return "bg-red-50 text-red-600 border-red-200";
      case ServerStatus.COMPLETED: return "bg-green-50 text-green-600 border-green-200";
      default: return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const handleFeedbackSubmit = () => {
    if (!feedbackForm.name.trim()) {
      setErrorMsg("请输入配件名称");
      return;
    }
    if (feedbackForm.quantity <= 0) {
      setErrorMsg("数量必须大于0");
      return;
    }
    
    if (selectedServerId && showFeedbackModal) {
      addFeedback(selectedServerId, {
        type: showFeedbackModal,
        partName: feedbackForm.name,
        quantity: feedbackForm.quantity,
        reason: feedbackForm.reason
      });
    }

    setShowFeedbackModal(null);
    setFeedbackForm({ name: "", quantity: 1, reason: "" });
    setErrorMsg(null);
  };

  // --- UI Components ---

  const Header = ({ title, subtitle, onBack, rightElement }: { title: string, subtitle?: string, onBack?: () => void, rightElement?: React.ReactNode }) => (
    <header className="bg-white/80 backdrop-blur-md px-6 pt-12 pb-4 sticky top-0 z-30 flex items-center justify-between border-b border-gray-100">
      <div className="flex items-center">
        {onBack && (
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={onBack} 
            className="p-2 -ml-2 mr-2 bg-gray-50 rounded-full"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </motion.button>
        )}
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h1>
          {subtitle && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{subtitle}</p>}
        </div>
      </div>
      {rightElement}
    </header>
  );

  const BottomNav = () => (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-100 px-8 pt-3 pb-8 flex justify-between items-center z-40 max-w-md mx-auto rounded-t-[32px] shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
      <motion.button 
        whileTap={{ scale: 0.9 }}
        onClick={() => { setView("LIST"); setActiveTab("PICKUP"); }}
        className={`flex flex-col items-center space-y-1.5 transition-all ${activeTab === "PICKUP" && view === "LIST" ? "text-brand-600" : "text-gray-400"}`}
      >
        <div className={`p-2 rounded-xl transition-all ${activeTab === "PICKUP" && view === "LIST" ? "bg-brand-50" : ""}`}>
          <Box className="w-6 h-6" />
        </div>
        <span className="text-[10px] font-bold">配件领取</span>
      </motion.button>
      
      <div className="relative -top-10">
        <motion.button 
          whileTap={{ scale: 0.85 }}
          onClick={() => setView("SCAN")}
          className="w-16 h-16 bg-brand-600 rounded-3xl flex items-center justify-center shadow-xl shadow-brand-200 border-4 border-white"
        >
          <Scan className="w-8 h-8 text-white" />
        </motion.button>
      </div>

      <motion.button 
        whileTap={{ scale: 0.9 }}
        onClick={() => { setView("LIST"); setActiveTab("OPERATE"); }}
        className={`flex flex-col items-center space-y-1.5 transition-all ${activeTab === "OPERATE" && view === "LIST" ? "text-brand-600" : "text-gray-400"}`}
      >
        <div className={`p-2 rounded-xl transition-all ${activeTab === "OPERATE" && view === "LIST" ? "bg-brand-50" : ""}`}>
          <Wrench className="w-6 h-6" />
        </div>
        <span className="text-[10px] font-bold">改配操作</span>
      </motion.button>
    </nav>
  );

  // --- Screens ---

  const ScanScreen = () => (
    <div className="h-full bg-black relative flex flex-col">
      <div className="absolute inset-0 opacity-40">
        <div className="w-full h-full bg-gradient-to-b from-brand-900/20 to-black" />
      </div>
      
      <header className="relative z-10 p-6 pt-12 flex justify-between items-center">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => setView("LIST")}
          className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white"
        >
          <X className="w-6 h-6" />
        </motion.button>
        <h2 className="text-white font-bold">扫描SN码</h2>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white"
        >
          <Flashlight className="w-6 h-6" />
        </motion.button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-10">
        <div className="w-full aspect-square relative">
          {/* Scan Frame */}
          <div className="absolute inset-0 border-2 border-white/20 rounded-[40px]" />
          <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-brand-500 rounded-tl-[40px]" />
          <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-brand-500 rounded-tr-[40px]" />
          <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-brand-500 rounded-bl-[40px]" />
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-brand-500 rounded-br-[40px]" />
          
          {/* Scan Line */}
          <motion.div 
            animate={{ top: ["10%", "90%", "10%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute left-6 right-6 h-[2px] bg-brand-400 shadow-[0_0_15px_rgba(96,165,250,0.8)] z-20"
          />

          <div className="absolute inset-0 flex items-center justify-center">
             <Camera className="w-12 h-12 text-white/10" />
          </div>
        </div>

        <div className="mt-12 w-full space-y-4">
          <p className="text-white/60 text-center text-sm">请将SN条码放入框内</p>
          <div className="relative">
            <input 
              autoFocus
              type="text" 
              placeholder="手动输入SN码..."
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleScanSuccess(scanInput)}
              className="w-full bg-white/10 border-2 border-white/10 rounded-2xl py-4 px-6 text-white text-center focus:border-brand-500 outline-none transition-all"
            />
            {scanInput && (
              <motion.button 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => handleScanSuccess(scanInput)}
                className="absolute right-2 top-2 bottom-2 px-4 bg-brand-600 rounded-xl text-white font-bold text-xs"
              >
                确认
              </motion.button>
            )}
          </div>
        </div>
      </div>

      <footer className="p-10 relative z-10 flex justify-center">
        <div className="bg-white/5 backdrop-blur-md p-2 rounded-3xl flex space-x-2">
          <button className="px-6 py-3 bg-white/10 rounded-2xl text-white text-xs font-bold">SN码</button>
          <button className="px-6 py-3 text-white/40 text-xs font-bold">资产编号</button>
        </div>
      </footer>
    </div>
  );

  const ServerListScreen = () => (
    <div className="flex flex-col h-full bg-gray-50">
      <Header 
        title="改配助手" 
        subtitle="Server Reconfig" 
        rightElement={
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => setView("MORE")}
            className="p-3 bg-gray-100 rounded-2xl text-gray-600"
          >
            <Settings className="w-5 h-5" />
          </motion.button>
        }
      />

      <div className="px-6 py-4 space-y-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
          <input 
            type="text" 
            placeholder="搜索SN、型号或位置..." 
            className="w-full pl-12 pr-4 py-4 bg-white border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-brand-500 text-sm transition-all"
          />
        </div>

        {activeTab === "PICKUP" && (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setView("PICKUP_SUMMARY")}
            className="w-full p-5 bg-brand-600 rounded-[32px] shadow-lg shadow-brand-100 flex items-center justify-between group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                <BarChart2 className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-bold">配件领取汇总</h3>
                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">查看总清单及服务器明细</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-white/40 group-active:text-white" />
          </motion.button>
        )}
      </div>

      <main className="flex-1 overflow-y-auto px-6 space-y-4 pb-32 no-scrollbar">
        <div className="flex items-center justify-between py-2">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            {activeTab === "PICKUP" ? "待领取任务" : "正在改配中"}
          </h2>
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            <span className="text-[10px] font-bold text-brand-600">{servers.length} 活跃</span>
          </div>
        </div>

        {servers.filter(s => activeTab === "PICKUP" ? s.status === ServerStatus.PENDING : s.status !== ServerStatus.PENDING).map((server, idx) => (
          <motion.div 
            key={server.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => {
              setSelectedServerId(server.id);
              setView(activeTab === "PICKUP" ? "PICKUP" : "RECONFIG");
            }}
            className="mobile-card p-5 group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-bold text-gray-900">{server.sn}</h3>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-tighter ${getStatusColor(server.status)}`}>
                    {server.status}
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-medium">{server.model}</p>
              </div>
              <div className="p-2 bg-gray-50 rounded-xl group-active:bg-brand-50 transition-colors">
                <ChevronRight className="w-5 h-5 text-gray-300 group-active:text-brand-500" />
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
              <div className="flex items-center text-[11px] font-bold text-gray-400">
                <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center mr-2">
                  <LayoutGrid className="w-3.5 h-3.5 text-gray-500" />
                </div>
                {server.location}
              </div>
              <div className="flex -space-x-2">
                {server.accessories.slice(0, 3).map((acc, i) => (
                  <div key={i} className="w-8 h-8 rounded-xl bg-white border-2 border-gray-50 flex items-center justify-center text-[10px] font-bold text-gray-600 shadow-sm">
                    {acc.name[0]}
                  </div>
                ))}
                {server.accessories.length > 3 && (
                  <div className="w-8 h-8 rounded-xl bg-brand-50 border-2 border-white flex items-center justify-center text-[10px] font-bold text-brand-600 shadow-sm">
                    +{server.accessories.length - 3}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </main>
      <BottomNav />
    </div>
  );

  const PickupDetailScreen = () => {
    if (!selectedServer) return null;
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <Header 
          title="配件领取" 
          subtitle={selectedServer.sn} 
          onBack={() => setView("LIST")} 
        />

        <main className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center">
                <Truck className="w-8 h-8 text-brand-600" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">服务器型号</p>
                <p className="text-lg font-bold text-gray-900">{selectedServer.model}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-2xl">
                <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">当前状态</p>
                <p className="text-xs font-bold text-gray-700">{selectedServer.status}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl">
                <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">存放位置</p>
                <p className="text-xs font-bold text-gray-700">{selectedServer.location}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">待领取清单</h2>
            {selectedServer.accessories.filter(a => a.type === "install").map(acc => (
              <motion.div 
                key={acc.id} 
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleAccessoryStatus(selectedServer.id, acc.id)}
                className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center group cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-4 transition-all ${acc.status === "done" ? "bg-green-50" : "bg-gray-50"}`}>
                  <Package className={`w-6 h-6 ${acc.status === "done" ? "text-green-600" : "text-gray-400"}`} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-gray-900">{acc.name}</h4>
                  <p className="text-xs text-gray-400 font-medium">需求数量: <span className="text-gray-900 font-bold">{acc.quantity}</span></p>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${acc.status === "done" ? "bg-green-500 text-white scale-110" : "bg-gray-100 text-gray-300"}`}>
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </motion.div>
            ))}
          </div>
        </main>

        <div className="p-6 bg-white border-t border-gray-100 pb-10">
          <button 
            onClick={() => setView("LIST")}
            className="btn-primary w-full"
          >
            确认领取完成
          </button>
        </div>
      </div>
    );
  };

  const ReconfigDetailScreen = () => {
    if (!selectedServer) return null;
    
    const steps = [
      { status: ServerStatus.PENDING, label: "待处理" },
      { status: ServerStatus.RECONFIGURING, label: "改配中" },
      { status: ServerStatus.WAITING_FOR_CONFIG, label: "等待配置" },
      { status: ServerStatus.PENDING_INSPECTION, label: "待检测" },
      { status: ServerStatus.INSPECTION_EXCEPTION, label: "检测异常" },
      { status: ServerStatus.COMPLETED, label: "改配完成" },
    ];

    const currentStepIndex = steps.findIndex(s => s.status === selectedServer.status);

    const nextStep = () => {
      const nextIndex = currentStepIndex + 1;
      if (nextIndex < steps.length) {
        updateServerStatus(selectedServer.id, steps[nextIndex].status);
      }
    };

    return (
      <div className="flex flex-col h-full bg-gray-50">
        <Header 
          title="改配操作" 
          subtitle={selectedServer.sn} 
          onBack={() => setView("LIST")}
          rightElement={
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowFeedbackModal("FAULTY")}
              className="p-3 bg-red-50 rounded-2xl text-red-500"
            >
              <AlertCircle className="w-5 h-5" />
            </motion.button>
          }
        />

        <main className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
          {/* Modern Stepper */}
          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
            <div className="flex justify-between items-center relative">
              {steps.map((step, idx) => (
                <div key={step.status} className="flex flex-col items-center z-10">
                  <motion.div 
                    animate={idx === currentStepIndex ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-bold transition-all ${idx <= currentStepIndex ? "bg-brand-600 text-white shadow-lg shadow-brand-100" : "bg-gray-100 text-gray-400"}`}
                  >
                    {idx < currentStepIndex ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </motion.div>
                  <span className={`text-[8px] mt-2 font-bold uppercase tracking-tighter ${idx <= currentStepIndex ? "text-brand-600" : "text-gray-400"}`}>{step.label}</span>
                </div>
              ))}
              <div className="absolute top-4 left-4 right-4 h-[2px] bg-gray-100 -z-0" />
              <motion.div 
                className="absolute top-4 left-4 h-[2px] bg-brand-600 -z-0" 
                initial={{ width: 0 }}
                animate={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 0.8, ease: "circOut" }}
              />
            </div>
          </div>

          <div className="space-y-8">
            <section>
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center">
                  <Plus className="w-4 h-4 mr-2 text-green-500" /> 需安装配件
                </h3>
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setView("FAULTY_FEEDBACK")}
                  className="text-[10px] font-bold text-brand-600 bg-brand-50 px-3 py-1.5 rounded-full flex items-center"
                >
                  故障增领
                  {selectedServer.feedbacks?.filter(f => f.type === "FAULTY").length ? (
                    <span className="ml-1 bg-brand-600 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px]">
                      {selectedServer.feedbacks.filter(f => f.type === "FAULTY").length}
                    </span>
                  ) : null}
                </motion.button>
              </div>
              <div className="space-y-3">
                {selectedServer.accessories.filter(a => a.type === "install").map(acc => (
                  <motion.div 
                    key={acc.id} 
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleAccessoryStatus(selectedServer.id, acc.id)}
                    className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center cursor-pointer"
                  >
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-gray-900">{acc.name}</h4>
                      <p className="text-xs text-gray-400 font-medium">数量: {acc.quantity}</p>
                    </div>
                    <div className={`px-5 py-2.5 rounded-2xl text-[10px] font-bold transition-all ${acc.status === "done" ? "bg-green-50 text-green-600" : "bg-brand-600 text-white shadow-md shadow-brand-100"}`}>
                      {acc.status === "done" ? "已安装" : "确认安装"}
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center">
                  <Minus className="w-4 h-4 mr-2 text-red-500" /> 需拆除配件
                </h3>
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setView("REMOVAL_FEEDBACK")}
                  className="text-[10px] font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full flex items-center"
                >
                  拆件反馈
                  {selectedServer.feedbacks?.filter(f => f.type === "REMOVAL").length ? (
                    <span className="ml-1 bg-orange-600 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px]">
                      {selectedServer.feedbacks.filter(f => f.type === "REMOVAL").length}
                    </span>
                  ) : null}
                </motion.button>
              </div>
              <div className="space-y-3">
                {selectedServer.accessories.filter(a => a.type === "remove").map(acc => (
                  <motion.div 
                    key={acc.id} 
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleAccessoryStatus(selectedServer.id, acc.id)}
                    className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center cursor-pointer"
                  >
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-gray-900">{acc.name}</h4>
                      <p className="text-xs text-gray-400 font-medium">数量: {acc.quantity}</p>
                    </div>
                    <div className={`px-5 py-2.5 rounded-2xl text-[10px] font-bold transition-all ${acc.status === "done" ? "bg-gray-100 text-gray-400" : "bg-red-500 text-white shadow-md shadow-red-100"}`}>
                      {acc.status === "done" ? "已拆除" : "确认拆除"}
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          </div>

          {/* Feedback Records Section */}
          {selectedServer.feedbacks && selectedServer.feedbacks.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2 flex items-center">
                <History className="w-4 h-4 mr-2 text-brand-500" /> 反馈记录
              </h3>
              <div className="space-y-3">
                {selectedServer.feedbacks.map((fb) => (
                  <motion.div 
                    key={fb.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-5 rounded-3xl border shadow-sm ${fb.type === "FAULTY" ? "bg-red-50 border-red-100" : "bg-orange-50 border-orange-100"}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${fb.type === "FAULTY" ? "bg-red-500 text-white" : "bg-orange-500 text-white"}`}>
                            {fb.type === "FAULTY" ? "故障增领" : "拆件反馈"}
                          </span>
                          <h4 className="text-sm font-bold text-gray-900">{fb.partName}</h4>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">数量: <span className="font-bold text-gray-900">{fb.quantity}</span></p>
                        {fb.reason && <p className="text-[10px] text-gray-400 mt-1 italic">原因: {fb.reason}</p>}
                      </div>
                      <span className="text-[8px] text-gray-400 font-medium">{new Date(fb.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}
        </main>

        <div className="p-6 bg-white border-t border-gray-100 flex gap-4 pb-10">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => updateServerStatus(selectedServer.id, ServerStatus.INSPECTION_EXCEPTION)}
            className="flex-1 bg-red-50 text-red-600 py-4 rounded-2xl text-sm font-bold"
          >
            异常
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={nextStep}
            disabled={selectedServer.status === ServerStatus.COMPLETED}
            className="flex-[2] btn-primary"
          >
            {selectedServer.status === ServerStatus.COMPLETED ? "任务已完成" : "下一步"}
          </motion.button>
        </div>
      </div>
    );
  };

  const MoreOperationsScreen = () => {
    const handleBatchInspect = () => {
      const pendingInspection = servers.filter(s => s.status === ServerStatus.PENDING_INSPECTION);
      if (pendingInspection.length === 0) return;
      setServers(prev => prev.map(s => 
        s.status === ServerStatus.PENDING_INSPECTION ? { ...s, status: ServerStatus.COMPLETED } : s
      ));
      setView("LIST");
    };

    return (
      <div className="flex flex-col h-full bg-gray-50">
        <Header title="更多操作" subtitle="Settings & Tools" onBack={() => setView("LIST")} />

        <main className="p-6 space-y-8 no-scrollbar overflow-y-auto pb-32">
          <div className="bg-white rounded-[40px] overflow-hidden shadow-sm border border-gray-100">
            <div className="p-8 bg-brand-600 flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-[24px] flex items-center justify-center border border-white/20">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-lg">操作员 0892</p>
                <div className="flex items-center mt-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                  <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">当前在线</p>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {[
                { icon: ClipboardList, label: "批量结单检测", color: "blue", action: handleBatchInspect },
                { icon: AlertCircle, label: "故障件反馈历史", color: "red" },
                { icon: History, label: "拆件反馈历史", color: "orange" },
                { icon: Truck, label: "物流信息查询", color: "purple" }
              ].map((item, i) => (
                <motion.button 
                  key={i}
                  whileTap={{ scale: 0.98 }}
                  onClick={item.action}
                  className="w-full flex items-center justify-between p-5 hover:bg-gray-50 rounded-3xl transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 bg-${item.color}-50 rounded-2xl flex items-center justify-center`}>
                      <item.icon className={`w-5 h-5 text-${item.color}-600`} />
                    </div>
                    <span className="text-sm font-bold text-gray-700">{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </motion.button>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">操作指南</h3>
            <div className="space-y-6">
              {[
                { title: "扫描SN码", desc: "对准服务器背部的SN条形码进行扫描，系统将自动匹配任务。" },
                { title: "确认配件", desc: "领取配件时请务必核对实物数量，点击确认后状态将同步。" },
                { title: "故障反馈", desc: "如发现配件损坏，请点击右上角感叹号进行增领申请。" }
              ].map((item, i) => (
                <div key={i} className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center text-xs font-bold text-gray-400 shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-1">{item.title}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  };

  const FaultyFeedbackScreen = () => {
    if (!selectedServer) return null;
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <Header title="反馈故障件及增领" subtitle={selectedServer.sn} onBack={() => setView("RECONFIG")} />
        
        <main className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          {/* Scan/Add Section */}
          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">扫描或输入故障件Model</h3>
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setFeedbackForm({ name: "", quantity: 1, reason: "" });
                setErrorMsg(null);
                setShowFeedbackModal("FAULTY");
              }}
              className="w-full py-4 bg-brand-600 text-white rounded-2xl font-bold flex items-center justify-center shadow-lg shadow-brand-100"
            >
              <Plus className="w-5 h-5 mr-2" /> 添加型号
            </motion.button>
          </div>

          {/* Faulty List */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">坏件清单</h3>
              <span className="text-[10px] font-bold text-gray-400">共{(selectedServer.feedbacks?.filter(f => f.type === "FAULTY").length || 0)}种型号</span>
            </div>
            <p className="text-[10px] text-gray-400 px-2 leading-relaxed">已扫描的坏件将在此列出，请确认信息并将配件放置到坏件盒中按型号分类管理</p>
            
            {selectedServer.feedbacks?.filter(f => f.type === "FAULTY").map((item) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm"
              >
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-sm font-bold text-gray-900">{item.partName}</h4>
                  <motion.button 
                    whileTap={{ scale: 0.8 }}
                    onClick={() => {
                      setServers(prev => prev.map(s => s.id === selectedServer.id ? { ...s, feedbacks: s.feedbacks?.filter(f => f.id !== item.id) } : s));
                    }}
                  >
                    <X className="w-4 h-4 text-red-400" />
                  </motion.button>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">当前数量: <span className="font-bold text-gray-900">{item.quantity}</span></p>
                  <div className="px-4 py-2 bg-brand-50 text-brand-600 text-[10px] font-bold rounded-xl">
                    已记录
                  </div>
                </div>
              </motion.div>
            ))}

            {(!selectedServer.feedbacks || selectedServer.feedbacks.filter(f => f.type === "FAULTY").length === 0) && (
              <div className="bg-white/50 border border-dashed border-gray-200 p-8 rounded-3xl text-center">
                <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-400">暂无故障件记录</p>
              </div>
            )}
          </div>

          {/* Re-issue List */}
          {selectedServer.feedbacks && selectedServer.feedbacks.filter(f => f.type === "FAULTY").length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">申领清单</h3>
              <p className="text-[10px] text-orange-500 px-2 font-medium">同Model型号增领配件的厂商或与首次不一致，请严格按系统推荐领用。</p>
              
              {selectedServer.feedbacks.filter(f => f.type === "FAULTY").map((item) => (
                <div key={item.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{item.partName}</h4>
                    <p className="text-[10px] text-brand-600 font-medium mt-1">盒号: BJJXQ01-1F1-SA1-1</p>
                  </div>
                  <span className="text-sm font-bold text-gray-900">x {item.quantity}</span>
                </div>
              ))}
            </div>
          )}
        </main>

        <div className="p-6 bg-white border-t border-gray-100 pb-10">
          <button onClick={() => setView("RECONFIG")} className="btn-primary w-full">提交反馈</button>
        </div>
      </div>
    );
  };

  const RemovalFeedbackScreen = () => {
    if (!selectedServer) return null;
    const categories = ["CPU", "硬盘", "内存", "GPU", "SSD", "网卡"];
    const [activeCat, setActiveCat] = useState("CPU");

    return (
      <div className="flex flex-col h-full bg-gray-50">
        <Header title="原机拆件反馈" subtitle={selectedServer.sn} onBack={() => setView("RECONFIG")} />
        
        {/* Category Tabs */}
        <div className="bg-white px-4 py-3 border-b border-gray-100 overflow-x-auto no-scrollbar flex space-x-2">
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`px-5 py-2 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${activeCat === cat ? "bg-brand-600 text-white shadow-md shadow-brand-100" : "bg-gray-100 text-gray-400"}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <main className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          {/* Warning Info */}
          <div className="bg-yellow-50 p-5 rounded-3xl border border-yellow-100 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-yellow-800 mb-1">Model差异说明</h4>
              <p className="text-[10px] text-yellow-700 leading-relaxed">若原系统同种型号下部分实物不符，请指定差异Model号与数量。</p>
            </div>
          </div>

          {/* Server Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xs font-bold text-gray-900 flex items-center">
                <div className="w-1 h-4 bg-brand-600 rounded-full mr-2" /> {activeCat}
              </h3>
              <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">1个规格</span>
            </div>

            {[selectedServer.sn, "6100840701082422"].map((sn, i) => (
              <div key={i} className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm">
                <div className="px-6 py-3 bg-gray-50 flex justify-between items-center border-b border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400">服务器: {sn}</span>
                  <span className="text-[10px] font-bold text-gray-300">2 台服务器</span>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-medium">原Model号</span>
                    <span className="text-gray-900 font-bold">E5-2690v4</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-medium">盒号</span>
                    <span className="text-gray-900 font-bold">-</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-medium">剩余原Model数量</span>
                    <span className="text-gray-900 font-bold">2</span>
                  </div>
                  <motion.button 
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setFeedbackForm({ name: activeCat, quantity: 1, reason: "" });
                      setErrorMsg(null);
                      setShowFeedbackModal("REMOVAL");
                    }}
                    className="w-full py-3 border-2 border-brand-100 text-brand-600 rounded-2xl text-xs font-bold flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4 mr-2" /> 修正Model号
                  </motion.button>
                </div>
              </div>
            ))}

            {/* Real Feedback Records for Removal */}
            {selectedServer.feedbacks?.filter(f => f.type === "REMOVAL").length ? (
              <div className="space-y-4 mt-8">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">已反馈差异</h3>
                {selectedServer.feedbacks.filter(f => f.type === "REMOVAL").map(fb => (
                  <motion.div 
                    key={fb.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-orange-50 p-5 rounded-3xl border border-orange-100 shadow-sm flex justify-between items-center"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{fb.partName}</h4>
                      <p className="text-[10px] text-orange-600 mt-1">{fb.reason || "无备注"}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-bold text-gray-900">x{fb.quantity}</span>
                      <motion.button 
                        whileTap={{ scale: 0.8 }}
                        onClick={() => {
                          setServers(prev => prev.map(s => s.id === selectedServer.id ? { ...s, feedbacks: s.feedbacks?.filter(f => f.id !== fb.id) } : s));
                        }}
                      >
                        <X className="w-4 h-4 text-orange-400" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : null}
          </div>
        </main>

        <div className="p-6 bg-white border-t border-gray-100 pb-10">
          <button onClick={() => setView("RECONFIG")} className="btn-primary w-full">确认并入库</button>
        </div>
      </div>
    );
  };

  const PickupSummaryScreen = () => {
    const [summaryTab, setSummaryTab] = useState<"TOTAL" | "BY_SERVER">("TOTAL");
    
    // Aggregate accessories
    const totalAccessories = servers
      .filter(s => s.status === ServerStatus.PENDING)
      .flatMap(s => s.accessories.filter(a => a.type === "install"))
      .reduce((acc, curr) => {
        const existing = acc.find(item => item.name === curr.name);
        if (existing) {
          existing.quantity += curr.quantity;
          if (curr.status === "done") existing.done += curr.quantity;
        } else {
          acc.push({ 
            name: curr.name, 
            quantity: curr.quantity, 
            done: curr.status === "done" ? curr.quantity : 0 
          });
        }
        return acc;
      }, [] as { name: string, quantity: number, done: number }[]);

    const pendingServers = servers.filter(s => s.status === ServerStatus.PENDING);

    return (
      <div className="flex flex-col h-full bg-gray-50">
        <Header title="配件领取汇总" subtitle="Pickup Summary" onBack={() => setView("LIST")} />
        
        <div className="px-6 py-4">
          <div className="bg-white p-1 rounded-2xl flex shadow-sm border border-gray-100">
            <button 
              onClick={() => setSummaryTab("TOTAL")}
              className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${summaryTab === "TOTAL" ? "bg-brand-600 text-white shadow-md shadow-brand-100" : "text-gray-400"}`}
            >
              总配件清单
            </button>
            <button 
              onClick={() => setSummaryTab("BY_SERVER")}
              className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${summaryTab === "BY_SERVER" ? "bg-brand-600 text-white shadow-md shadow-brand-100" : "text-gray-400"}`}
            >
              按服务器查看
            </button>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto px-6 space-y-6 pb-32 no-scrollbar">
          {summaryTab === "TOTAL" ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">汇总配件清单</h3>
                <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">{totalAccessories.length} 种配件</span>
              </div>
              {totalAccessories.map((acc, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center"
                >
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mr-4">
                    <Package className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-900">{acc.name}</h4>
                    <div className="flex items-center mt-1 space-x-3">
                      <p className="text-[10px] text-gray-400 font-medium">总需求: <span className="text-gray-900 font-bold">{acc.quantity}</span></p>
                      <p className="text-[10px] text-gray-400 font-medium">已领: <span className="text-green-600 font-bold">{acc.done}</span></p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-brand-600">{acc.quantity - acc.done}</div>
                    <div className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">待领</div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">服务器清单</h3>
                <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">{pendingServers.length} 台服务器</span>
              </div>
              {pendingServers.map((server, i) => (
                <motion.div 
                  key={server.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => {
                    setSelectedServerId(server.id);
                    setView("PICKUP");
                  }}
                  className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm group active:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-brand-50 rounded-xl flex items-center justify-center">
                        <ServerIcon className="w-4 h-4 text-brand-600" />
                      </div>
                      <h4 className="text-sm font-bold text-gray-900">{server.sn}</h4>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-active:text-brand-500" />
                  </div>
                  <div className="space-y-2">
                    {server.accessories.filter(a => a.type === "install").map((acc, j) => (
                      <div key={j} className="flex justify-between items-center text-[11px]">
                        <span className="text-gray-500 font-medium">{acc.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-900 font-bold">x{acc.quantity}</span>
                          {acc.status === "done" ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-100" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto h-screen bg-white overflow-hidden shadow-2xl relative font-sans">
      <AnimatePresence mode="wait">
        {view === "LIST" && (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
            <ServerListScreen />
          </motion.div>
        )}
        {view === "SCAN" && (
          <motion.div key="scan" initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="h-full z-50">
            <ScanScreen />
          </motion.div>
        )}
        {view === "PICKUP" && (
          <motion.div key="pickup" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className="h-full">
            <PickupDetailScreen />
          </motion.div>
        )}
        {view === "RECONFIG" && (
          <motion.div key="reconfig" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className="h-full">
            <ReconfigDetailScreen />
          </motion.div>
        )}
        {view === "FAULTY_FEEDBACK" && (
          <motion.div key="faulty" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className="h-full">
            <FaultyFeedbackScreen />
          </motion.div>
        )}
        {view === "REMOVAL_FEEDBACK" && (
          <motion.div key="removal" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className="h-full">
            <RemovalFeedbackScreen />
          </motion.div>
        )}
        {view === "MORE" && (
          <motion.div key="more" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="h-full">
            <MoreOperationsScreen />
          </motion.div>
        )}
        {view === "PICKUP_SUMMARY" && (
          <motion.div key="pickup-summary" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="h-full">
            <PickupSummaryScreen />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Modal */}
      <AnimatePresence>
        {showFeedbackModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowFeedbackModal(null)}
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-md rounded-t-[48px] p-8 shadow-2xl pb-12"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-8" />
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-gray-900">
                  {showFeedbackModal === "FAULTY" ? "故障件反馈" : "原机拆件反馈"}
                </h3>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowFeedbackModal(null)} className="p-2 bg-gray-50 rounded-full">
                  <X className="w-5 h-5 text-gray-400" />
                </motion.button>
              </div>

              {errorMsg && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center space-x-2 text-red-600 text-xs font-bold"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>{errorMsg}</span>
                </motion.div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block tracking-widest">配件名称</label>
                  <input 
                    type="text" 
                    value={feedbackForm.name}
                    onChange={e => setFeedbackForm({...feedbackForm, name: e.target.value})}
                    placeholder="请输入配件名称"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block tracking-widest">数量</label>
                  <div className="flex items-center space-x-6">
                    <motion.button 
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setFeedbackForm({...feedbackForm, quantity: Math.max(1, feedbackForm.quantity - 1)})}
                      className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center"
                    >
                      <Minus className="w-5 h-5 text-gray-600" />
                    </motion.button>
                    <span className="text-2xl font-bold text-gray-900 w-8 text-center">{feedbackForm.quantity}</span>
                    <motion.button 
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setFeedbackForm({...feedbackForm, quantity: feedbackForm.quantity + 1})}
                      className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center"
                    >
                      <Plus className="w-5 h-5 text-gray-600" />
                    </motion.button>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block tracking-widest">反馈原因</label>
                  <textarea 
                    rows={3}
                    value={feedbackForm.reason}
                    onChange={e => setFeedbackForm({...feedbackForm, reason: e.target.value})}
                    placeholder="请详细描述情况..."
                    className="input-field resize-none"
                  />
                </div>
              </div>

              <motion.button 
                whileTap={{ scale: 0.96 }}
                onClick={handleFeedbackSubmit}
                className="btn-primary w-full mt-10"
              >
                提交反馈
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
