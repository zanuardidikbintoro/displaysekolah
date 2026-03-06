import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, MonitorPlay, Save, Plus, Trash2, Upload, 
  Image as ImageIcon, Video, Calendar, Users, Home, 
  Clock, Play, Pause, ChevronRight, CheckCircle2, XCircle
} from 'lucide-react';

// --- 1. DATABASE & STORAGE HELPERS (IndexedDB untuk Media, LocalStorage untuk Teks) ---
const DB_NAME = 'SchoolSignageDB';
const STORE_NAME = 'mediaFiles';

const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const saveMediaFile = async (id, file) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(file, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

const getMediaFile = async (id) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const deleteMediaFile = async (id) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

// --- 2. KONSTANTA TEMA WARNA (PALET KOMBINASI SOLID) & 20 LAYOUT TAMPILAN ---
// Menggunakan 3 kombinasi warna solid: [Header, Footer/Ticker, Aksen/Border]
const COLORS = [
  { id: 'corporate', name: 'Corporate', preview: ['#0f172a', '#1d4ed8', '#38bdf8'], classes: { headerBg: 'bg-slate-900', footerBg: 'bg-blue-700', border: 'border-sky-400', text: 'text-blue-700' } },
  { id: 'elegance', name: 'Elegance', preview: ['#0a0a0a', '#b45309', '#f59e0b'], classes: { headerBg: 'bg-neutral-950', footerBg: 'bg-amber-700', border: 'border-amber-500', text: 'text-amber-700' } },
  { id: 'nature', name: 'Nature', preview: ['#022c22', '#0f766e', '#84cc16'], classes: { headerBg: 'bg-emerald-950', footerBg: 'bg-teal-700', border: 'border-lime-500', text: 'text-emerald-800' } },
  { id: 'sunset', name: 'Sunset', preview: ['#3b0764', '#ea580c', '#facc15'], classes: { headerBg: 'bg-purple-950', footerBg: 'bg-orange-600', border: 'border-yellow-400', text: 'text-purple-800' } },
  { id: 'patriot', name: 'Patriot', preview: ['#991b1b', '#1e293b', '#ef4444'], classes: { headerBg: 'bg-red-800', footerBg: 'bg-slate-800', border: 'border-red-500', text: 'text-red-700' } },
  { id: 'ocean', name: 'Oceanic', preview: ['#172554', '#0e7490', '#2dd4bf'], classes: { headerBg: 'bg-blue-950', footerBg: 'bg-cyan-700', border: 'border-teal-400', text: 'text-cyan-800' } },
  { id: 'berry', name: 'Berry', preview: ['#4c0519', '#be185d', '#e879f9'], classes: { headerBg: 'bg-rose-950', footerBg: 'bg-pink-700', border: 'border-fuchsia-400', text: 'text-rose-800' } },
  { id: 'earth', name: 'Earthy', preview: ['#1c1917', '#3f6212', '#f97316'], classes: { headerBg: 'bg-stone-900', footerBg: 'bg-lime-800', border: 'border-orange-500', text: 'text-stone-800' } },
  { id: 'royal', name: 'Royal', preview: ['#1e1b4b', '#6d28d9', '#fbbf24'], classes: { headerBg: 'bg-indigo-950', footerBg: 'bg-violet-700', border: 'border-amber-400', text: 'text-indigo-800' } },
  { id: 'modern', name: 'Modern', preview: ['#18181b', '#52525b', '#22d3ee'], classes: { headerBg: 'bg-zinc-900', footerBg: 'bg-zinc-600', border: 'border-cyan-400', text: 'text-zinc-800' } },
];

// Helper untuk mini preview box
const Box = ({color, flex='1'}) => <div className={`bg-${color} rounded-[2px]`} style={{flex}} />;

const LAYOUTS = [
  {
    id: 'l1', name: '1. Standar Kiri', 
    render: (C) => <div className="flex flex-col h-screen">{C.header}<div className="flex-1 flex gap-4 p-4 overflow-hidden"><div className="w-2/3 flex flex-col gap-4">{C.video}{C.slide}</div><div className="w-1/3 flex flex-col gap-4">{C.agenda}{C.guru}</div></div>{C.ticker}</div>,
    preview: () => <div className="flex flex-col h-full gap-0.5"><Box color="indigo-500"/><div className="flex-1 flex gap-1"><div className="w-2/3 flex flex-col gap-0.5"><Box color="gray-400" flex="2"/><Box color="gray-400"/></div><div className="w-1/3 flex flex-col gap-0.5"><Box color="gray-300"/><Box color="gray-300"/></div></div><Box color="indigo-200" flex="0.5"/></div>
  },
  {
    id: 'l2', name: '2. Standar Kanan', 
    render: (C) => <div className="flex flex-col h-screen">{C.header}<div className="flex-1 flex gap-4 p-4 overflow-hidden"><div className="w-1/3 flex flex-col gap-4">{C.agenda}{C.guru}</div><div className="w-2/3 flex flex-col gap-4">{C.video}{C.slide}</div></div>{C.ticker}</div>,
    preview: () => <div className="flex flex-col h-full gap-0.5"><Box color="indigo-500"/><div className="flex-1 flex gap-1"><div className="w-1/3 flex flex-col gap-0.5"><Box color="gray-300"/><Box color="gray-300"/></div><div className="w-2/3 flex flex-col gap-0.5"><Box color="gray-400" flex="2"/><Box color="gray-400"/></div></div><Box color="indigo-200" flex="0.5"/></div>
  },
  {
    id: 'l3', name: '3. Grid Seimbang (2x2)', 
    render: (C) => <div className="flex flex-col h-screen">{C.header}<div className="flex-1 grid grid-cols-2 grid-rows-2 gap-4 p-4 overflow-hidden">{C.video}{C.slide}{C.agenda}{C.guru}</div>{C.ticker}</div>,
    preview: () => <div className="flex flex-col h-full gap-0.5"><Box color="indigo-500"/><div className="flex-1 grid grid-cols-2 grid-rows-2 gap-0.5"><Box color="gray-400"/><Box color="gray-400"/><Box color="gray-300"/><Box color="gray-300"/></div><Box color="indigo-200" flex="0.5"/></div>
  },
  {
    id: 'l4', name: '4. Sinema (Atas Lebar)', 
    render: (C) => <div className="flex flex-col h-screen">{C.header}<div className="flex-1 flex flex-col gap-4 p-4 overflow-hidden"><div className="h-3/5">{C.video}</div><div className="h-2/5 grid grid-cols-3 gap-4">{C.slide}{C.agenda}{C.guru}</div></div>{C.ticker}</div>,
    preview: () => <div className="flex flex-col h-full gap-0.5"><Box color="indigo-500"/><div className="flex-1 flex flex-col gap-0.5"><Box color="gray-400" flex="1.5"/><div className="flex-1 grid grid-cols-3 gap-0.5"><Box color="gray-400"/><Box color="gray-300"/><Box color="gray-300"/></div></div><Box color="indigo-200" flex="0.5"/></div>
  },
  {
    id: 'l5', name: '5. Horizontal Split', 
    render: (C) => <div className="flex flex-col h-screen">{C.header}<div className="flex-1 flex flex-col gap-4 p-4 overflow-hidden"><div className="h-1/2 flex gap-4">{C.video}{C.slide}</div><div className="h-1/2 flex gap-4">{C.agenda}{C.guru}</div></div>{C.ticker}</div>,
    preview: () => <div className="flex flex-col h-full gap-0.5"><Box color="indigo-500"/><div className="flex-1 flex flex-col gap-0.5"><div className="flex-1 flex gap-0.5"><Box color="gray-400"/><Box color="gray-400"/></div><div className="flex-1 flex gap-0.5"><Box color="gray-300"/><Box color="gray-300"/></div></div><Box color="indigo-200" flex="0.5"/></div>
  },
  {
    id: 'l6', name: '6. Fokus Video Kiri', 
    render: (C) => <div className="flex flex-col h-screen">{C.header}<div className="flex-1 grid grid-cols-4 gap-4 p-4 overflow-hidden"><div className="col-span-3">{C.video}</div><div className="col-span-1 flex flex-col gap-4">{C.slide}{C.agenda}{C.guru}</div></div>{C.ticker}</div>,
    preview: () => <div className="flex flex-col h-full gap-0.5"><Box color="indigo-500"/><div className="flex-1 flex gap-0.5"><div className="w-3/4"><Box color="gray-400"/></div><div className="w-1/4 flex flex-col gap-0.5"><Box color="gray-400"/><Box color="gray-300"/><Box color="gray-300"/></div></div><Box color="indigo-200" flex="0.5"/></div>
  },
  {
    id: 'l7', name: '7. Fokus Info Kiri', 
    render: (C) => <div className="flex flex-col h-screen">{C.header}<div className="flex-1 grid grid-cols-4 gap-4 p-4 overflow-hidden"><div className="col-span-1 flex flex-col gap-4">{C.slide}{C.agenda}{C.guru}</div><div className="col-span-3">{C.video}</div></div>{C.ticker}</div>,
    preview: () => <div className="flex flex-col h-full gap-0.5"><Box color="indigo-500"/><div className="flex-1 flex gap-0.5"><div className="w-1/4 flex flex-col gap-0.5"><Box color="gray-400"/><Box color="gray-300"/><Box color="gray-300"/></div><div className="w-3/4"><Box color="gray-400"/></div></div><Box color="indigo-200" flex="0.5"/></div>
  },
  {
    id: 'l8', name: '8. Ticker Atas', 
    render: (C) => <div className="flex flex-col h-screen">{C.ticker}{C.header}<div className="flex-1 flex gap-4 p-4 overflow-hidden"><div className="w-2/3 flex flex-col gap-4">{C.video}{C.slide}</div><div className="w-1/3 flex flex-col gap-4">{C.agenda}{C.guru}</div></div></div>,
    preview: () => <div className="flex flex-col h-full gap-0.5"><Box color="indigo-200" flex="0.5"/><Box color="indigo-500"/><div className="flex-1 flex gap-1"><div className="w-2/3 flex flex-col gap-0.5"><Box color="gray-400"/><Box color="gray-400"/></div><div className="w-1/3 flex flex-col gap-0.5"><Box color="gray-300"/><Box color="gray-300"/></div></div></div>
  },
  {
    id: 'l9', name: '9. Sidebar Header', 
    render: (C) => <div className="flex h-screen"><div className="w-1/4 flex flex-col">{C.headerVertical}{C.tickerVertical}</div><div className="w-3/4 flex gap-4 p-4 overflow-hidden"><div className="w-2/3 flex flex-col gap-4">{C.video}{C.slide}</div><div className="w-1/3 flex flex-col gap-4">{C.agenda}{C.guru}</div></div></div>,
    preview: () => <div className="flex h-full gap-0.5"><div className="w-1/4 flex flex-col gap-0.5"><Box color="indigo-500" flex="3"/><Box color="indigo-200" flex="1"/></div><div className="w-3/4 flex gap-0.5 py-0.5"><div className="w-2/3 flex flex-col gap-0.5"><Box color="gray-400"/><Box color="gray-400"/></div><div className="w-1/3 flex flex-col gap-0.5"><Box color="gray-300"/><Box color="gray-300"/></div></div></div>
  },
  {
    id: 'l10', name: '10. Tiga Kolom Sejajar', 
    render: (C) => <div className="flex flex-col h-screen">{C.header}<div className="flex-1 grid grid-cols-3 gap-4 p-4 overflow-hidden"><div className="col-span-1">{C.video}</div><div className="col-span-1 flex flex-col gap-4">{C.slide}{C.agenda}</div><div className="col-span-1">{C.guru}</div></div>{C.ticker}</div>,
    preview: () => <div className="flex flex-col h-full gap-0.5"><Box color="indigo-500"/><div className="flex-1 grid grid-cols-3 gap-0.5"><Box color="gray-400"/><div className="flex flex-col gap-0.5"><Box color="gray-400"/><Box color="gray-300"/></div><Box color="gray-300"/></div><Box color="indigo-200" flex="0.5"/></div>
  },
  {
    id: 'l11', name: '11. Fokus Slide Kiri', 
    render: (C) => <div className="flex flex-col h-screen">{C.header}<div className="flex-1 grid grid-cols-3 gap-4 p-4 overflow-hidden"><div className="col-span-2">{C.slide}</div><div className="col-span-1 flex flex-col gap-4">{C.video}{C.agenda}{C.guru}</div></div>{C.ticker}</div>,
    preview: () => <div className="flex flex-col h-full gap-0.5"><Box color="indigo-500"/><div className="flex-1 grid grid-cols-3 gap-0.5"><div className="col-span-2"><Box color="gray-400"/></div><div className="col-span-1 flex flex-col gap-0.5"><Box color="gray-400"/><Box color="gray-300"/><Box color="gray-300"/></div></div><Box color="indigo-200" flex="0.5"/></div>
  },
  {
    id: 'l12', name: '12. Media Di Tengah', 
    render: (C) => <div className="flex flex-col h-screen">{C.header}<div className="flex-1 grid grid-cols-4 gap-4 p-4 overflow-hidden"><div className="col-span-1">{C.agenda}</div><div className="col-span-2 flex flex-col gap-4">{C.video}{C.slide}</div><div className="col-span-1">{C.guru}</div></div>{C.ticker}</div>,
    preview: () => <div className="flex flex-col h-full gap-0.5"><Box color="indigo-500"/><div className="flex-1 grid grid-cols-4 gap-0.5"><Box color="gray-300"/><div className="col-span-2 flex flex-col gap-0.5"><Box color="gray-400"/><Box color="gray-400"/></div><Box color="gray-300"/></div><Box color="indigo-200" flex="0.5"/></div>
  },
  {
    id: 'l13', name: '13. Mozaik Kiri', 
    render: (C) => <div className="flex flex-col h-screen">{C.header}<div className="flex-1 grid grid-cols-3 grid-rows-2 gap-4 p-4 overflow-hidden"><div className="col-span-2 row-span-2">{C.video}</div><div className="col-span-1">{C.slide}</div><div className="col-span-1 flex gap-4">{C.agenda}{C.guru}</div></div>{C.ticker}</div>,
    preview: () => <div className="flex flex-col h-full gap-0.5"><Box color="indigo-500"/><div className="flex-1 grid grid-cols-3 grid-rows-2 gap-0.5"><div className="col-span-2 row-span-2"><Box color="gray-400"/></div><Box color="gray-400"/><div className="flex gap-0.5"><Box color="gray-300"/><Box color="gray-300"/></div></div><Box color="indigo-200" flex="0.5"/></div>
  },
  {
    id: 'l14', name: '14. Background Video Overlay', 
    render: (C) => <div className="flex flex-col h-screen relative">{C.header}<div className="absolute inset-0 z-0 top-24 bottom-12 opacity-30">{C.video}</div><div className="flex-1 flex gap-4 p-4 overflow-hidden z-10"><div className="w-1/4">{C.slide}</div><div className="w-1/2"></div><div className="w-1/4 flex flex-col gap-4">{C.agenda}{C.guru}</div></div>{C.ticker}</div>,
    preview: () => <div className="flex flex-col h-full gap-0.5 relative"><Box color="indigo-500"/><div className="flex-1 flex gap-0.5 bg-gray-400 p-0.5"><div className="w-1/4"><Box color="gray-800"/></div><div className="w-1/2"></div><div className="w-1/4 flex flex-col gap-0.5"><Box color="gray-300"/><Box color="gray-300"/></div></div><Box color="indigo-200" flex="0.5"/></div>
  },
  {
    id: 'l15', name: '15. Empat Kolom Vertikal', 
    render: (C) => <div className="flex flex-col h-screen">{C.header}<div className="flex-1 grid grid-cols-4 gap-4 p-4 overflow-hidden">{C.video}{C.slide}{C.agenda}{C.guru}</div>{C.ticker}</div>,
    preview: () => <div className="flex flex-col h-full gap-0.5"><Box color="indigo-500"/><div className="flex-1 grid grid-cols-4 gap-0.5"><Box color="gray-400"/><Box color="gray-400"/><Box color="gray-300"/><Box color="gray-300"/></div><Box color="indigo-200" flex="0.5"/></div>
  },
  {
    id: 'l16', name: '16. Media Dominan Tengah', 
    render: (C) => <div className="flex flex-col h-screen">{C.header}<div className="flex-1 flex p-4 gap-4 overflow-hidden"><div className="w-1/5 flex flex-col">{C.agenda}</div><div className="w-3/5 flex flex-col gap-4">{C.video}{C.slide}</div><div className="w-1/5 flex flex-col">{C.guru}</div></div>{C.ticker}</div>,
    preview: () => <div className="flex flex-col h-full gap-0.5"><Box color="indigo-500"/><div className="flex-1 flex gap-0.5"><div className="w-1/5"><Box color="gray-300"/></div><div className="w-3/5 flex flex-col gap-0.5"><Box color="gray-400" flex="2"/><Box color="gray-400"/></div><div className="w-1/5"><Box color="gray-300"/></div></div><Box color="indigo-200" flex="0.5"/></div>
  },
  {
    id: 'l17', name: '17. Baris Sejajar Atas-Bawah', 
    render: (C) => <div className="flex flex-col h-screen">{C.header}<div className="flex-1 grid grid-rows-2 gap-4 p-4 overflow-hidden"><div className="grid grid-cols-2 gap-4">{C.video}{C.slide}</div><div className="grid grid-cols-2 gap-4">{C.agenda}{C.guru}</div></div>{C.ticker}</div>,
    preview: () => <div className="flex flex-col h-full gap-0.5"><Box color="indigo-500"/><div className="flex-1 grid grid-rows-2 gap-0.5"><div className="grid grid-cols-2 gap-0.5"><Box color="gray-400"/><Box color="gray-400"/></div><div className="grid grid-cols-2 gap-0.5"><Box color="gray-300"/><Box color="gray-300"/></div></div><Box color="indigo-200" flex="0.5"/></div>
  },
  {
    id: 'l18', name: '18. Split Vertikal Info Lebar', 
    render: (C) => <div className="flex flex-col h-screen">{C.header}<div className="flex-1 flex gap-4 p-4 overflow-hidden"><div className="w-1/2 flex flex-col gap-4">{C.video}{C.agenda}</div><div className="w-1/2 flex flex-col gap-4">{C.slide}{C.guru}</div></div>{C.ticker}</div>,
    preview: () => <div className="flex flex-col h-full gap-0.5"><Box color="indigo-500"/><div className="flex-1 flex gap-1"><div className="w-1/2 flex flex-col gap-0.5"><Box color="gray-400"/><Box color="gray-300"/></div><div className="w-1/2 flex flex-col gap-0.5"><Box color="gray-400"/><Box color="gray-300"/></div></div><Box color="indigo-200" flex="0.5"/></div>
  },
  {
    id: 'l19', name: '19. Diagonal View', 
    render: (C) => <div className="flex flex-col h-screen">{C.header}<div className="flex-1 grid grid-cols-2 grid-rows-2 gap-4 p-4 overflow-hidden"><div className="col-span-1">{C.video}</div><div className="col-span-1">{C.agenda}</div><div className="col-span-1">{C.guru}</div><div className="col-span-1">{C.slide}</div></div>{C.ticker}</div>,
    preview: () => <div className="flex flex-col h-full gap-0.5"><Box color="indigo-500"/><div className="flex-1 grid grid-cols-2 grid-rows-2 gap-0.5"><Box color="gray-400"/><Box color="gray-300"/><Box color="gray-300"/><Box color="gray-400"/></div><Box color="indigo-200" flex="0.5"/></div>
  },
  {
    id: 'l20', name: '20. Full Tumpuk 1 Kolom (Minimalis)', 
    render: (C) => <div className="flex flex-col h-screen overflow-y-auto bg-gray-100">{C.header}<div className="flex flex-col gap-4 p-4 max-w-4xl mx-auto w-full"><div className="h-96 shrink-0">{C.video}</div><div className="h-64 shrink-0">{C.slide}</div><div className="h-64 shrink-0">{C.agenda}</div><div className="h-64 shrink-0">{C.guru}</div></div>{C.ticker}</div>,
    preview: () => <div className="flex flex-col h-full gap-0.5"><Box color="indigo-500"/><div className="flex-1 flex flex-col gap-0.5 items-center px-2"><div className="w-3/4 flex flex-col gap-0.5 h-full"><Box color="gray-400"/><Box color="gray-400"/><Box color="gray-300"/></div></div><Box color="indigo-200" flex="0.5"/></div>
  }
];

// --- 3. DATA MODEL & INITIAL STATE ---
const initialData = {
  school: {
    name: 'SMA N 1 Nusantara',
    address: 'Jl. Pendidikan No. 1, Jakarta, Indonesia',
    logoId: null
  },
  runningText: 'Selamat Datang di SMA N 1 Nusantara | Visi: Menjadi sekolah berprestasi dan berkarakter | Pengumuman: Ujian Akhir Semester dimulai tanggal 15 Desember.',
  settings: {
    layoutId: 'l1', 
    colorId: 'corporate', // Diubah defaultnya
    marqueeSpeed: 25, 
    verticalScrollSpeed: 20 
  },
  agendas: [
    { id: '1', title: 'Upacara Bendera', date: 'Senin', time: '07:00 - 08:00' },
    { id: '2', title: 'Rapat Guru', date: 'Rabu', time: '14:00 - 16:00' },
  ],
  teachers: [
    { id: '1', name: 'Budi Santoso, M.Pd', subject: 'Matematika', isPresent: true, remark: '', photoId: null },
    { id: '2', name: 'Siti Aminah, S.Pd', subject: 'Bahasa Indonesia', isPresent: false, remark: 'Sakit', photoId: null },
    { id: '3', name: 'Joko Widodo, M.Kom', subject: 'Informatika', isPresent: true, remark: '', photoId: null },
  ],
  schedules: [
    { id: '1', teacherId: '1', class: 'XII IPA 1', time: '08:00 - 09:30' },
    { id: '2', teacherId: '3', class: 'XI IPS 2', time: '10:00 - 11:30' },
  ],
  mediaIds: {
    images: [],
    videos: []
  }
};

// --- 4. MAIN APPLICATION COMPONENT ---
export default function App() {
  const [mode, setMode] = useState('display'); // 'display' | 'admin'
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [dbMediaCache, setDbMediaCache] = useState({});

  // Muat Data dari LocalStorage & IndexedDB
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedData = localStorage.getItem('schoolSignageData');
        if (savedData) {
          setData(JSON.parse(savedData));
        }
      } catch (e) {
        console.error("Gagal memuat data", e);
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Simpan Data ke LocalStorage setiap ada perubahan (Kecuali Media Besar)
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('schoolSignageData', JSON.stringify(data));
    }
  }, [data, isLoading]);

  const updateData = (key, value) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) return <div className="h-screen w-screen flex items-center justify-center bg-gray-900 text-white">Memuat Data...</div>;

  return (
    <div className="min-h-screen w-full font-sans antialiased overflow-hidden">
      {mode === 'admin' ? (
        <AdminPanel 
          data={data} 
          updateData={updateData} 
          replaceData={setData}
          onClose={() => setMode('display')} 
        />
      ) : (
        <DisplayScreen 
          data={data} 
          onOpenAdmin={() => setMode('admin')} 
        />
      )}
    </div>
  );
}

// ==========================================
// --- 5. TAMPILAN DISPLAY (FRONTEND) ---
// ==========================================
function DisplayScreen({ data, onOpenAdmin }) {
  const { school, runningText, settings, agendas, teachers, schedules, mediaIds } = data;
  const [currentTime, setCurrentTime] = useState(new Date());
  const [logoUrl, setLogoUrl] = useState(null);
  
  const [imageUrls, setImageUrls] = useState([]);
  const [videoUrls, setVideoUrls] = useState([]);

  // Konfigurasi Tata Letak & Warna
  const activeColor = COLORS.find(c => c.id === settings.colorId) || COLORS[0];
  const activeLayout = LAYOUTS.find(l => l.id === settings.layoutId) || LAYOUTS[0];
  
  // Style Dasar Kotak Widget
  const widgetClass = `bg-white border-t-4 ${activeColor.classes.border} shadow-md rounded-xl overflow-hidden flex flex-col w-full h-full relative`;

  // Waktu Live
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load Media dari IndexedDB
  useEffect(() => {
    const loadMediaUrls = async () => {
      // Logo
      if (school.logoId) {
        const file = await getMediaFile(school.logoId);
        if (file) setLogoUrl(URL.createObjectURL(file));
      }

      // Images
      const imgUrls = [];
      for (const id of mediaIds.images) {
        const file = await getMediaFile(id);
        if (file) imgUrls.push(URL.createObjectURL(file));
      }
      setImageUrls(imgUrls);

      // Videos
      const vidUrls = [];
      for (const id of mediaIds.videos) {
        const file = await getMediaFile(id);
        if (file) vidUrls.push(URL.createObjectURL(file));
      }
      setVideoUrls(vidUrls);
    };

    loadMediaUrls();

    // Cleanup object URLs to prevent memory leaks
    return () => {
      if (logoUrl) URL.revokeObjectURL(logoUrl);
      imageUrls.forEach(url => URL.revokeObjectURL(url));
      videoUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [mediaIds, school.logoId]);

  // --- PEMBUATAN ELEMEN WIDGET UNTUK DIINJEKSI KE LAYOUT ---
  const C = {
    header: (
      <header className={`h-24 px-6 flex items-center justify-between shadow-md z-20 shrink-0 ${activeColor.classes.headerBg} text-white`}>
        <div className="flex items-center gap-4">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="h-16 w-16 object-contain bg-white rounded-full p-1 shadow-sm" />
          ) : (
            <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center shadow-sm">
              <Home size={32} />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{school.name}</h1>
            <p className="text-sm opacity-90">{school.address}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold tracking-wider">
            {currentTime.toLocaleTimeString('id-ID')}
          </div>
          <div className="text-sm opacity-90 font-medium">
            {currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </header>
    ),
    headerVertical: (
      <header className={`flex-1 p-6 flex flex-col items-center shadow-md z-20 ${activeColor.classes.headerBg} text-white`}>
         {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="h-24 w-24 object-contain bg-white rounded-full p-1 mb-4 shadow-sm" />
          ) : (
            <div className="h-24 w-24 bg-white/20 rounded-full flex items-center justify-center mb-4 shadow-sm">
              <Home size={40} />
            </div>
          )}
          <h1 className="text-2xl font-bold tracking-tight text-center mb-2">{school.name}</h1>
          <p className="text-xs opacity-90 text-center mb-8">{school.address}</p>
          <div className="mt-auto text-center w-full pt-6 border-t border-white/20">
            <div className="text-2xl font-bold tracking-wider mb-1">
              {currentTime.toLocaleTimeString('id-ID')}
            </div>
            <div className="text-xs opacity-90 font-medium">
              {currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
      </header>
    ),
    ticker: (
      <footer className={`h-12 flex items-center shadow-inner overflow-hidden z-20 shrink-0 ${activeColor.classes.footerBg} text-white`}>
        <div className="px-4 py-2 bg-black/30 font-bold whitespace-nowrap h-full flex items-center z-20">
          INFORMASI:
        </div>
        <div className="flex-1 overflow-hidden h-full flex items-center relative">
           <div 
             className="animate-marquee whitespace-nowrap text-lg font-medium tracking-wide"
             style={{ animationDuration: `${settings.marqueeSpeed || 25}s` }}
           >
              {runningText || "Selamat datang di sistem informasi sekolah..."}
           </div>
        </div>
      </footer>
    ),
    tickerVertical: (
      <footer className={`h-12 flex items-center shadow-inner overflow-hidden z-20 shrink-0 ${activeColor.classes.footerBg} text-white`}>
         <div className="flex-1 overflow-hidden h-full flex items-center relative">
           <div 
             className="animate-marquee whitespace-nowrap text-sm font-medium tracking-wide"
             style={{ animationDuration: `${settings.marqueeSpeed || 25}s` }}
           >
              {runningText || "Selamat datang..."}
           </div>
        </div>
      </footer>
    ),
    video: (
      <div className={widgetClass}>
        <VideoPlayer playlist={videoUrls} />
      </div>
    ),
    slide: (
      <div className={widgetClass}>
        <ImageSlideshow images={imageUrls} />
      </div>
    ),
    agenda: (
      <div className={`${widgetClass} p-4`}>
        <div className={`flex items-center gap-2 mb-3 pb-2 border-b-2 ${activeColor.classes.border} shrink-0 z-10 bg-white`}>
          <Calendar size={24} className={activeColor.classes.text} />
          <h2 className="text-xl font-bold text-gray-800">Agenda Kegiatan</h2>
        </div>
        <div className="flex-1 overflow-hidden relative">
          <div 
            className="animate-scroll-up w-full space-y-3"
            style={{ animationDuration: `${settings.verticalScrollSpeed || 20}s` }}
          >
            {agendas.length === 0 ? <p className="text-gray-500 italic">Tidak ada agenda</p> : null}
            {agendas.map(agenda => (
              <div key={agenda.id} className="bg-gray-50 p-3 rounded-lg border-l-4 border-gray-300 hover:border-gray-500 transition-colors text-gray-800 shadow-sm">
                <h3 className="font-semibold text-lg">{agenda.title}</h3>
                <div className="flex items-center gap-4 text-sm mt-1 text-gray-500">
                  <span className="flex items-center gap-1"><Calendar size={14}/> {agenda.date}</span>
                  <span className="flex items-center gap-1"><Clock size={14}/> {agenda.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    guru: (
      <div className={`${widgetClass} p-4`}>
        <div className={`flex items-center gap-2 mb-3 pb-2 border-b-2 ${activeColor.classes.border} shrink-0 z-10 bg-white`}>
          <Users size={24} className={activeColor.classes.text} />
          <h2 className="text-xl font-bold text-gray-800">Kehadiran Guru</h2>
        </div>
        <div className="flex-1 overflow-hidden relative">
          <div 
            className="animate-scroll-up w-full space-y-3"
            style={{ animationDuration: `${settings.verticalScrollSpeed || 20}s` }}
          >
            {teachers.length === 0 ? <p className="text-gray-500 italic">Data guru kosong</p> : null}
            {teachers.map(teacher => {
              const teacherSchedules = schedules.filter(s => s.teacherId === teacher.id);
              return (
                <div key={teacher.id} className="flex flex-col bg-gray-50 p-3 rounded-lg border border-gray-100 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-bold">{teacher.name}</h3>
                      <p className="text-xs text-gray-500">{teacher.subject}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${teacher.isPresent ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {teacher.isPresent ? <CheckCircle2 size={14}/> : <XCircle size={14}/>}
                        {teacher.isPresent ? 'ADA' : 'TIDAK'}
                      </div>
                      {!teacher.isPresent && teacher.remark && (
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100 text-right max-w-[100px] truncate" title={teacher.remark}>
                          Ket: {teacher.remark}
                        </span>
                      )}
                    </div>
                  </div>
                  {teacherSchedules.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200 flex flex-col gap-1 text-sm">
                      {teacherSchedules.map(sched => (
                        <div key={sched.id} className="flex justify-between items-center bg-white p-1.5 rounded border border-gray-100 shadow-sm">
                          <span className="font-semibold text-indigo-700">Kls: {sched.class}</span>
                          <span className="text-gray-500 text-xs font-medium">{sched.time}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    )
  };

  return (
    <div className={`h-screen w-screen bg-gray-200 relative`}>
      {/* Tombol Tersembunyi untuk Buka Admin */}
      <div className="absolute top-2 right-2 z-50 opacity-0 hover:opacity-100 transition-opacity">
        <button onClick={onOpenAdmin} className="bg-black/80 text-white p-3 rounded-full hover:bg-black shadow-lg">
          <Settings size={24} />
        </button>
      </div>

      {/* RENDER LAYOUT DINAMIS */}
      {activeLayout.render(C)}

      {/* CSS untuk Marquee dan Auto-Scroll Vertikal */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: inline-block;
          animation-name: marquee;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }

        @keyframes scrollUp {
          from { top: 100%; transform: translateY(0); }
          to { top: 0; transform: translateY(-100%); }
        }
        .animate-scroll-up {
          position: absolute;
          animation-name: scrollUp;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .animate-scroll-up:hover {
          animation-play-state: paused;
        }
      `}} />
    </div>
  );
}

// Sub-Component: Video Player
function VideoPlayer({ playlist, colorClass }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && playlist.length > 0) {
      videoRef.current.load();
      videoRef.current.play().catch(e => console.log("Autoplay dicegah:", e));
    }
  }, [currentIndex, playlist]);

  const handleEnded = () => {
    setCurrentIndex((prev) => (prev + 1) % playlist.length);
  };

  if (!playlist || playlist.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200/50 text-gray-400">
        <Video size={48} className="mb-2" />
        <p>Belum ada video di-upload</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black group">
      <video
        ref={videoRef}
        src={playlist[currentIndex]}
        className="w-full h-full object-cover"
        onEnded={handleEnded}
        autoPlay
        muted // Muted biasanya diperlukan untuk autoplay di beberapa browser
        controls={false}
      />
      <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs text-white bg-black/50 backdrop-blur-sm border border-white/20`}>
        Video {currentIndex + 1} / {playlist.length}
      </div>
    </div>
  );
}

// Sub-Component: Image Slideshow
function ImageSlideshow({ images, colorClass }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000); // Ganti gambar setiap 5 detik
    return () => clearInterval(interval);
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200/50 text-gray-400">
        <ImageIcon size={48} className="mb-2" />
        <p>Belum ada gambar di-upload</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-gray-800 overflow-hidden">
      {images.map((img, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `url(${img})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      ))}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2 z-10">
        {images.map((_, idx) => (
          <div 
            key={idx} 
            className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-white scale-125' : 'bg-white/50'}`} 
          />
        ))}
      </div>
    </div>
  );
}


// ==========================================
// --- 6. TAMPILAN ADMIN (BACKEND) ---
// ==========================================
function AdminPanel({ data, updateData, replaceData, onClose }) {
  const [activeTab, setActiveTab] = useState('info'); // info, agenda, guru, media, setting

  const tabs = [
    { id: 'info', label: 'Info Sekolah', icon: Home },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'guru', label: 'Guru & Jadwal', icon: Users },
    { id: 'media', label: 'Media Galeri', icon: ImageIcon },
    { id: 'setting', label: 'Tema & Tampilan', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col text-gray-900">
      {/* Admin Header */}
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <Settings size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold">Dashboard Admin</h1>
            <p className="text-sm text-gray-500">Kelola Konten Display Sekolah</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
        >
          <MonitorPlay size={20} />
          Kembali ke Layar Display
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Nav */}
        <aside className="w-64 bg-white border-r overflow-y-auto">
          <nav className="p-4 space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon size={20} />
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Admin Content */}
        <main className="flex-1 p-8 overflow-y-auto bg-gray-50">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
            {activeTab === 'info' && <AdminInfo data={data} updateData={updateData} />}
            {activeTab === 'agenda' && <AdminAgenda data={data} updateData={updateData} />}
            {activeTab === 'guru' && <AdminGuru data={data} updateData={updateData} />}
            {activeTab === 'media' && <AdminMedia data={data} updateData={updateData} />}
            {activeTab === 'setting' && <AdminSetting data={data} updateData={updateData} replaceData={replaceData} />}
          </div>
        </main>
      </div>
    </div>
  );
}

// -- Panel: Info Sekolah --
function AdminInfo({ data, updateData }) {
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    if (data.school.logoId) {
      getMediaFile(data.school.logoId).then(file => {
        if (file) setLogoPreview(URL.createObjectURL(file));
      });
    }
  }, [data.school.logoId]);

  const handleChange = (e) => {
    updateData('school', { ...data.school, [e.target.name]: e.target.value });
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const id = 'logo_' + Date.now();
      await saveMediaFile(id, file);
      
      // Hapus logo lama jika ada
      if (data.school.logoId) await deleteMediaFile(data.school.logoId);
      
      updateData('school', { ...data.school, logoId: id });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold mb-1">Informasi Dasar Sekolah</h2>
        <p className="text-gray-500 mb-6">Ubah nama, alamat, dan teks berjalan (marquee).</p>
      </div>

      <div className="flex gap-6 items-start">
        {/* Logo Upload */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden relative">
            {logoPreview ? (
              <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" />
            ) : (
              <ImageIcon className="text-gray-400" size={40} />
            )}
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleLogoUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
          <span className="text-sm text-gray-500 font-medium">Upload Logo Baru</span>
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Sekolah</label>
            <input 
              type="text" name="name" value={data.school.name} onChange={handleChange}
              className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
            <textarea 
              name="address" value={data.school.address} onChange={handleChange} rows="2"
              className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" 
            />
          </div>
        </div>
      </div>

      <hr className="my-6 border-gray-100" />
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Running Text (Marquee)</label>
        <p className="text-xs text-gray-500 mb-2">Teks ini akan berjalan di bagian bawah layar. Pisahkan pengumuman dengan tanda |</p>
        <textarea 
          value={data.runningText} 
          onChange={(e) => updateData('runningText', e.target.value)} 
          rows="3"
          className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
        />
      </div>
    </div>
  );
}

// -- Panel: Agenda --
function AdminAgenda({ data, updateData }) {
  const addAgenda = () => {
    const newAgenda = { id: Date.now().toString(), title: 'Agenda Baru', date: 'Senin', time: '08:00 - Selesai' };
    updateData('agendas', [...data.agendas, newAgenda]);
  };

  const updateAgenda = (id, field, value) => {
    const updated = data.agendas.map(a => a.id === id ? { ...a, [field]: value } : a);
    updateData('agendas', updated);
  };

  const removeAgenda = (id) => {
    updateData('agendas', data.agendas.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">Agenda Kegiatan</h2>
          <p className="text-gray-500">Kelola daftar acara atau kegiatan sekolah.</p>
        </div>
        <button onClick={addAgenda} className="flex items-center gap-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-4 py-2 rounded-lg font-medium transition-colors">
          <Plus size={18} /> Tambah Agenda
        </button>
      </div>

      <div className="space-y-3">
        {data.agendas.length === 0 && <p className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg border border-dashed">Belum ada agenda.</p>}
        {data.agendas.map((agenda, i) => (
          <div key={agenda.id} className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl hover:shadow-sm transition-shadow">
            <div className="font-bold text-gray-400 w-6">{i + 1}.</div>
            <div className="flex-1 grid grid-cols-12 gap-3">
              <div className="col-span-6">
                <input 
                  value={agenda.title} onChange={e => updateAgenda(agenda.id, 'title', e.target.value)}
                  placeholder="Nama Kegiatan"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="col-span-3">
                <input 
                  value={agenda.date} onChange={e => updateAgenda(agenda.id, 'date', e.target.value)}
                  placeholder="Hari/Tanggal"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="col-span-3">
                <input 
                  value={agenda.time} onChange={e => updateAgenda(agenda.id, 'time', e.target.value)}
                  placeholder="Waktu"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
            <button onClick={() => removeAgenda(agenda.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// -- Panel: Guru & Jadwal --
function AdminGuru({ data, updateData }) {
  const addTeacher = () => {
    const newT = { id: Date.now().toString(), name: 'Nama Guru', subject: 'Mata Pelajaran', isPresent: true, remark: '' };
    updateData('teachers', [...data.teachers, newT]);
  };

  const updateTeacher = (id, field, value) => {
    const updated = data.teachers.map(t => t.id === id ? { ...t, [field]: value } : t);
    updateData('teachers', updated);
  };

  const removeTeacher = (id) => {
    updateData('teachers', data.teachers.filter(t => t.id !== id));
    updateData('schedules', data.schedules.filter(s => s.teacherId !== id)); // Hapus jadwal terkait secara otomatis
  };

  const addSchedule = () => {
    const newS = { id: Date.now().toString(), teacherId: '', class: '', time: '' };
    updateData('schedules', [...data.schedules, newS]);
  };

  const updateSchedule = (id, field, value) => {
    const updated = data.schedules.map(s => s.id === id ? { ...s, [field]: value } : s);
    updateData('schedules', updated);
  };

  const removeSchedule = (id) => {
    updateData('schedules', data.schedules.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      
      {/* Bagian 1: Master Data Guru */}
      <div>
        <div className="flex justify-between items-end mb-4 border-b pb-2">
          <div>
            <h2 className="text-2xl font-bold mb-1">Master Data Guru</h2>
            <p className="text-gray-500">Kelola daftar profil guru dan status kehadirannya.</p>
          </div>
          <button onClick={addTeacher} className="flex items-center gap-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-4 py-2 rounded-lg font-medium transition-colors">
            <Plus size={18} /> Tambah Guru
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.teachers.length === 0 && <p className="col-span-full text-center text-gray-500 py-6 bg-gray-50 rounded-lg border border-dashed">Belum ada data guru.</p>}
          {data.teachers.map((t) => (
            <div key={t.id} className="p-4 bg-gray-50 border border-gray-200 rounded-xl relative flex flex-col gap-3">
              <button onClick={() => removeTeacher(t.id)} className="absolute top-3 right-3 text-red-400 hover:text-red-600 transition-colors">
                <Trash2 size={18} />
              </button>
              <div className="pr-8">
                <label className="text-xs text-gray-500 font-semibold uppercase">Nama Guru</label>
                <input 
                  value={t.name} onChange={e => updateTeacher(t.id, 'name', e.target.value)}
                  placeholder="Nama Lengkap & Gelar"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none font-medium mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-semibold uppercase">Mata Pelajaran</label>
                <input 
                  value={t.subject} onChange={e => updateTeacher(t.id, 'subject', e.target.value)}
                  placeholder="Mata Pelajaran"
                  className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none mt-1"
                />
              </div>
              <div className="flex flex-col gap-2 mt-1">
                <label className="flex items-center gap-2 cursor-pointer w-max">
                  <input 
                    type="checkbox" 
                    checked={t.isPresent} 
                    onChange={e => {
                      updateTeacher(t.id, 'isPresent', e.target.checked);
                      if (e.target.checked) updateTeacher(t.id, 'remark', ''); // Hapus keterangan jika kembali hadir
                    }}
                    className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className={`font-bold px-3 py-1 rounded-full text-xs ${t.isPresent ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {t.isPresent ? 'STATUS: HADIR' : 'STATUS: TIDAK HADIR'}
                  </span>
                </label>
                {!t.isPresent && (
                  <input 
                    value={t.remark || ''} 
                    onChange={e => updateTeacher(t.id, 'remark', e.target.value)}
                    placeholder="Keterangan (Sakit, Izin, Dinas...)"
                    className="w-full p-2 text-sm border border-red-300 bg-red-50 text-red-800 rounded focus:ring-1 focus:ring-red-500 outline-none placeholder-red-300"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bagian 2: Penjadwalan */}
      <div>
        <div className="flex justify-between items-end mb-4 border-b pb-2">
          <div>
            <h2 className="text-2xl font-bold mb-1">Jadwal Mengajar</h2>
            <p className="text-gray-500">Pilih guru dari Master Data untuk menetapkan jam mengajar.</p>
          </div>
          <button onClick={addSchedule} className="flex items-center gap-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-4 py-2 rounded-lg font-medium transition-colors">
            <Plus size={18} /> Tambah Jadwal
          </button>
        </div>

        <div className="space-y-3">
          {data.schedules.length === 0 && <p className="text-center text-gray-500 py-6 bg-gray-50 rounded-lg border border-dashed">Belum ada jadwal mengajar.</p>}
          {data.schedules.map((s, i) => (
            <div key={s.id} className="flex flex-wrap md:flex-nowrap items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl hover:shadow-sm transition-shadow">
              <div className="font-bold text-gray-400 w-6">{i + 1}.</div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-5">
                  <select 
                    value={s.teacherId} 
                    onChange={e => updateSchedule(s.id, 'teacherId', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="" disabled>-- Pilih Guru --</option>
                    {data.teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.subject})</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-4">
                  <input 
                    value={s.class} onChange={e => updateSchedule(s.id, 'class', e.target.value)}
                    placeholder="Kelas (contoh: XII IPA 1)"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="md:col-span-3">
                  <input 
                    value={s.time} onChange={e => updateSchedule(s.id, 'time', e.target.value)}
                    placeholder="Waktu (08:00 - 09:30)"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              <button onClick={() => removeSchedule(s.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-auto md:ml-0">
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}

// -- Panel: Media (Gambar & Video) --
function AdminMedia({ data, updateData }) {
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // Load preview
  useEffect(() => {
    const loadPrevs = async () => {
      const imgs = await Promise.all(data.mediaIds.images.map(async id => {
        const file = await getMediaFile(id);
        return { id, url: file ? URL.createObjectURL(file) : null };
      }));
      setImages(imgs.filter(i => i.url));

      const vids = await Promise.all(data.mediaIds.videos.map(async id => {
        const file = await getMediaFile(id);
        return { id, url: file ? URL.createObjectURL(file) : null };
      }));
      setVideos(vids.filter(v => v.url));
    };
    loadPrevs();
  }, [data.mediaIds]);

  const handleUpload = async (e, type) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    setIsUploading(true);
    const newIds = [];
    for (const file of files) {
      const id = `${type}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await saveMediaFile(id, file);
      newIds.push(id);
    }
    
    updateData('mediaIds', {
      ...data.mediaIds,
      [type === 'image' ? 'images' : 'videos']: [...data.mediaIds[type === 'image' ? 'images' : 'videos'], ...newIds]
    });
    setIsUploading(false);
  };

  const removeMedia = async (id, type) => {
    await deleteMediaFile(id);
    const targetArr = type === 'image' ? data.mediaIds.images : data.mediaIds.videos;
    updateData('mediaIds', {
      ...data.mediaIds,
      [type === 'image' ? 'images' : 'videos']: targetArr.filter(i => i !== id)
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold mb-1">Galeri Media</h2>
        <p className="text-gray-500">Upload video untuk diputar berulang dan gambar untuk slideshow. Semua disimpan secara lokal.</p>
      </div>

      {isUploading && (
        <div className="p-4 bg-indigo-50 text-indigo-700 rounded-lg animate-pulse flex items-center gap-3">
          <Upload className="animate-bounce" /> Sedang memproses dan menyimpan file...
        </div>
      )}

      {/* Bagian Video */}
      <div>
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h3 className="text-lg font-bold flex items-center gap-2"><Video className="text-indigo-600"/> Playlist Video (Loop)</h3>
          <label className="cursor-pointer bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition">
            <Plus size={16}/> Upload Video
            <input type="file" accept="video/*" multiple onChange={(e) => handleUpload(e, 'video')} className="hidden" />
          </label>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {videos.length === 0 && <p className="col-span-full text-gray-400 italic text-sm py-4">Belum ada video.</p>}
          {videos.map((vid, i) => (
            <div key={vid.id} className="relative group bg-black rounded-lg overflow-hidden aspect-video">
              <video src={vid.url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" />
              <button onClick={() => removeMedia(vid.id, 'video')} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 size={16} />
              </button>
              <div className="absolute bottom-2 left-2 text-xs bg-black/70 text-white px-2 py-1 rounded">Video {i+1}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bagian Gambar */}
      <div>
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h3 className="text-lg font-bold flex items-center gap-2"><ImageIcon className="text-indigo-600"/> Slideshow Gambar</h3>
          <label className="cursor-pointer bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition">
            <Plus size={16}/> Upload Gambar
            <input type="file" accept="image/*" multiple onChange={(e) => handleUpload(e, 'image')} className="hidden" />
          </label>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.length === 0 && <p className="col-span-full text-gray-400 italic text-sm py-4">Belum ada gambar slideshow.</p>}
          {images.map((img, i) => (
            <div key={img.id} className="relative group bg-gray-100 rounded-lg overflow-hidden aspect-square border border-gray-200">
              <img src={img.url} className="w-full h-full object-cover" alt="Slide" />
              <button onClick={() => removeMedia(img.id, 'image')} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// -- Panel: Pengaturan Tema --
function AdminSetting({ data, updateData, replaceData }) {
  const [importMessage, setImportMessage] = useState({ text: '', type: '' });

  const updateSetting = (key, val) => {
    updateData('settings', { ...data.settings, [key]: val });
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-sekolah-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        if (importedData && importedData.school && importedData.settings) {
          replaceData(importedData);
          setImportMessage({ text: 'Data berhasil di-import!', type: 'success' });
        } else {
          setImportMessage({ text: 'Format file tidak valid!', type: 'error' });
        }
      } catch (error) {
        setImportMessage({ text: 'Gagal membaca file JSON!', type: 'error' });
      }
      setTimeout(() => setImportMessage({ text: '', type: '' }), 5000);
    };
    reader.readAsText(file);
    e.target.value = null; // reset input
  };

  // Helper untuk membuat preview blok warna (bukan gradasi menyatu)
  const getStripedBackground = (colors) => {
    if(colors.length === 3) {
      return `linear-gradient(135deg, ${colors[0]} 33.33%, ${colors[1]} 33.33% 66.66%, ${colors[2]} 66.66%)`;
    }
    return `linear-gradient(135deg, ${colors[0]} 50%, ${colors[1]} 50%)`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      <div>
        <h2 className="text-2xl font-bold mb-1">Tata Letak & Warna</h2>
        <p className="text-gray-500">Personalisasi tampilan layar Display dan sesuaikan kecepatan auto-scroll.</p>
      </div>

      {/* Pilihan Warna */}
      <div>
        <h3 className="text-lg font-semibold mb-3">1. Pilih Palet Warna (Kombinasi Solid)</h3>
        <div className="flex flex-wrap gap-4">
          {COLORS.map(c => (
            <button
              key={c.id}
              onClick={() => updateSetting('colorId', c.id)}
              className={`flex flex-col items-center gap-2 transition-transform ${data.settings.colorId === c.id ? 'scale-110 font-bold' : 'opacity-70 hover:opacity-100'}`}
              title={`Header: ${c.classes.headerBg}, Footer: ${c.classes.footerBg}`}
            >
              <div 
                className={`w-14 h-14 rounded-full border-4 shadow-sm ${data.settings.colorId === c.id ? 'border-gray-900 shadow-md' : 'border-transparent'}`} 
                style={{ background: getStripedBackground(c.preview) }}
              />
              <span className="text-xs">{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Pilihan Tema Layout */}
      <div>
        <h3 className="text-lg font-semibold mb-3">2. Pilih Struktur Tata Letak (20 Layout)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {LAYOUTS.map(l => {
            const isActive = data.settings.layoutId === l.id;
            
            return (
              <button
                key={l.id}
                onClick={() => updateSetting('layoutId', l.id)}
                className={`p-3 text-left border-2 rounded-xl transition-all flex flex-col items-center gap-3 ${isActive ? 'border-indigo-600 bg-indigo-50 shadow-md ring-2 ring-indigo-200' : 'border-gray-200 hover:border-indigo-300 bg-white'}`}
              >
                <div className="w-full h-24 bg-gray-100 border border-gray-200 p-2 rounded-lg flex items-center justify-center pointer-events-none shadow-inner">
                  {l.preview()}
                </div>
                <span className="text-xs font-bold text-center text-gray-700 leading-tight h-8 flex items-center">{l.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pengaturan Kecepatan Scroll */}
      <div>
        <h3 className="text-lg font-semibold mb-3">3. Pengaturan Kecepatan Animasi</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          
          {/* Kecepatan Ticker Horizontal */}
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-bold text-gray-700">Running Text (Bawah)</label>
              <span className="text-sm font-bold text-indigo-600">{data.settings.marqueeSpeed || 25} Detik</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">Satu putaran penuh teks horizontal berjalan.</p>
            <input
              type="range"
              min="5"
              max="120"
              value={data.settings.marqueeSpeed || 25}
              onChange={(e) => updateSetting('marqueeSpeed', Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Cepat</span>
              <span>Lambat</span>
            </div>
          </div>

          {/* Kecepatan Scroll Vertikal */}
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-bold text-gray-700">Scroll Agenda & Guru</label>
              <span className="text-sm font-bold text-indigo-600">{data.settings.verticalScrollSpeed || 20} Detik</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">Satu putaran penuh scroll dari bawah ke atas.</p>
            <input
              type="range"
              min="5"
              max="120"
              value={data.settings.verticalScrollSpeed || 20}
              onChange={(e) => updateSetting('verticalScrollSpeed', Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Cepat</span>
              <span>Lambat</span>
            </div>
          </div>

        </div>
      </div>

      {/* Import / Export Data */}
      <div>
        <h3 className="text-lg font-semibold mb-3">4. Manajemen Data (Backup & Restore)</h3>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <p className="text-sm text-gray-500">
            Gunakan fitur ini untuk memindahkan pengaturan (Teks, Agenda, Guru, Tema, Layout) dari komputer ke Android STB. 
            <strong className="text-red-500 block mt-1">Catatan: File Media (Logo, Gambar & Video) tidak ikut diexport karena ukuran besar. Anda harus mengunggah ulang media di perangkat tujuan.</strong>
          </p>
          
          {importMessage.text && (
            <div className={`p-3 rounded text-sm font-bold ${importMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {importMessage.text}
            </div>
          )}

          <div className="flex flex-wrap gap-4">
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Save size={18} /> Export Data (.json)
            </button>
            
            <label className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer">
              <Upload size={18} /> Import Data
              <input 
                type="file" 
                accept=".json" 
                onChange={handleImport}
                className="hidden" 
              />
            </label>
          </div>
        </div>
      </div>

    </div>
  );
}
