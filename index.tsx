import React, { useState, useRef, useMemo, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  ChevronRight, 
  FileText, 
  PlusCircle, 
  LayoutDashboard, 
  ClipboardList, 
  Box, 
  Calendar as CalendarIcon, 
  BarChart3, 
  Menu,
  X,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Paperclip,
  Upload,
  Link as LinkIcon,
  MapPin,
  User,
  MessageSquare,
  Clock,
  Timer,
  Bell,
  Target,
  BookOpen,
  Activity as ActivityIcon,
  PieChart as PieChartIcon,
  Shield,
  WifiOff
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
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

// Types
type Role = 'Administradora' | 'Educadora';

interface Material {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  minStock: number;
}

interface RequestItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  priority: boolean;
}

interface Request {
  id: string;
  title: string;
  requesterName: string;
  role: Role;
  date: string;
  status: 'Pendiente' | 'En preparación' | 'Entregado' | 'Rechazado';
  items: RequestItem[];
  emailAlert: boolean;
  room: string;
  evidence?: string; // For file uploads
  activityId?: string; // Link to an activity
  eventId?: string; // Link to an event
}

interface EventComment {
  id: string;
  user: string;
  text: string;
  date: string; // Date when the comment was made
  supportDate: string; // Date when they can help
  durationMinutes: number; // How long they can help
}

interface Event {
  id: string;
  title: string;
  date: string;
  type: string;
  description: string;
  responsible: string;
  room: string;
  evidence?: string;
  comments?: EventComment[];
}

interface Activity {
  id: string;
  title: string;
  date: string;
  status: string;
  room: string;
  objectives: string;
  description: string;
  expectedLearnings: string;
  responsible: string;
}

// Mock Data
const INITIAL_MATERIALS: Material[] = [
  { id: '1', name: 'Pelotas de fútbol', category: 'Deportes', stock: 15, unit: 'unidad', minStock: 5 },
  { id: '2', name: 'Colchonetas', category: 'Gimnasio', stock: 8, unit: 'unidad', minStock: 2 },
  { id: '3', name: 'Papel Artístico', category: 'Arte', stock: 50, unit: 'pliegos', minStock: 20 },
  { id: '4', name: 'Lápices de Colores', category: 'Arte', stock: 10, unit: 'cajas', minStock: 15 },
  { id: '5', name: 'Tijeras', category: 'Arte', stock: 25, unit: 'unidad', minStock: 10 },
  { id: '6', name: 'Conos', category: 'Deportes', stock: 4, unit: 'unidad', minStock: 10 },
];

const INITIAL_REQUESTS: Request[] = [
  { 
    id: '101', 
    title: 'Material para clase de gimnasia', 
    requesterName: 'Ana López', 
    role: 'Educadora', 
    date: '2023-10-24', 
    status: 'Pendiente', 
    items: [
      { id: 'r1', name: 'Aros de plástico', quantity: 10, unit: 'Unidad', priority: true }
    ], 
    emailAlert: false, 
    room: 'Gimnasio A',
    activityId: 'a1'
  },
  { 
    id: '102', 
    title: 'Pinturas para Taller', 
    requesterName: 'Ana López', 
    role: 'Educadora', 
    date: '2023-10-20', 
    status: 'Entregado', 
    items: [
      { id: 'r2', name: 'Papel Artístico', quantity: 20, unit: 'Pliegos', priority: false },
      { id: 'r3', name: 'Pinceles', quantity: 15, unit: 'Unidad', priority: false }
    ], 
    emailAlert: true, 
    room: 'Blue',
    activityId: 'a1'
  },
  { 
    id: '103', 
    title: 'Insumos Torneo', 
    requesterName: 'Carlos Ruiz', 
    role: 'Educadora', 
    date: '2023-10-15', 
    status: 'Entregado', 
    items: [
      { id: 'r4', name: 'Pelotas de fútbol', quantity: 5, unit: 'Unidad', priority: true },
      { id: 'r5', name: 'Conos', quantity: 10, unit: 'Unidad', priority: true }
    ], 
    emailAlert: false, 
    room: 'Cancha Principal',
    eventId: 'e1'
  }
];

const INITIAL_EVENTS: Event[] = [
  { 
    id: 'e1', 
    title: 'Torneo Interescolar', 
    date: '2023-11-10', 
    type: 'Deportivo', 
    description: 'Competencia anual',
    responsible: 'Carlos Ruiz',
    room: 'Cancha Principal',
    comments: [
      {
        id: 'c1',
        user: 'María Paz',
        text: 'Puedo ayudar con el arbitraje de los partidos menores.',
        date: '2023-10-20',
        supportDate: '2023-11-10',
        durationMinutes: 120
      }
    ]
  }
];

const INITIAL_ACTIVITIES: Activity[] = [
  { 
    id: 'a1', 
    title: 'Taller de Pintura', 
    date: '2023-10-26', 
    status: 'Programada',
    room: 'Blue',
    objectives: 'Fomentar la creatividad y motricidad fina.',
    description: 'Uso de acuarelas y mezcla de colores básicos.',
    expectedLearnings: 'Reconocimiento de colores primarios y secundarios.',
    responsible: 'Ana López'
  }
];

const ROOM_OPTIONS = ['Purple 1', 'Purple 2', 'Yellow', 'Blue', 'Green', 'Red', 'After', 'Deportes', 'Gimnasio', 'Patio', 'Otro'];

const generateId = () => Math.random().toString(36).substr(2, 9);

// Components

// Custom SVG Logo Component recreated from the user provided image
const KangarooLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 300 350" className={className} xmlns="http://www.w3.org/2000/svg">
    <g>
       {/* Colors from image: Dark Brown #A06843, Light Tan #D49E75, Darker Tan #C68E5D */}
       
       {/* Tail */}
       <path d="M35 230 Q 5 200, 20 150 L 50 180 C 30 200, 40 240, 90 270" fill="#A06843" />

       {/* Feet */}
       <path d="M80 310 C 60 310, 60 340, 100 340 L 140 340 C 130 320, 120 310, 80 310" fill="#A06843"/>
       <path d="M220 310 C 240 310, 240 340, 200 340 L 160 340 C 170 320, 180 310, 220 310" fill="#A06843"/>

       {/* Body Main */}
       <ellipse cx="150" cy="240" rx="85" ry="80" fill="#A06843" />

       {/* Belly / Pouch Background */}
       <ellipse cx="150" cy="250" rx="60" ry="55" fill="#D49E75" />

       {/* Head Main */}
       <circle cx="150" cy="110" r="65" fill="#A06843" />

       {/* Left Ear */}
       <path d="M95 70 Q 70 10, 110 15 Q 130 30, 125 60" fill="#A06843" />
       <path d="M100 60 Q 85 25, 110 25" fill="#D49E75" />

       {/* Right Ear */}
       <path d="M205 70 Q 230 10, 190 15 Q 170 30, 175 60" fill="#A06843" />
       <path d="M200 60 Q 215 25, 190 25" fill="#D49E75" />

       {/* Muzzle/Snout Area */}
       <ellipse cx="150" cy="135" rx="35" ry="28" fill="#D49E75" />

       {/* Nose */}
       <ellipse cx="150" cy="125" rx="18" ry="12" fill="#000000" />

       {/* Eyes */}
       <ellipse cx="125" cy="95" rx="8" ry="12" fill="#000000" />
       <ellipse cx="175" cy="95" rx="8" ry="12" fill="#000000" />

       {/* Joey in Pouch */}
       {/* Joey Head */}
       <circle cx="150" cy="230" r="25" fill="#8D5A2B" />
       {/* Joey Ears */}
       <ellipse cx="135" cy="210" rx="5" ry="10" fill="#8D5A2B" transform="rotate(-20 135 210)" />
       <ellipse cx="165" cy="210" rx="5" ry="10" fill="#8D5A2B" transform="rotate(20 165 210)" />
       {/* Joey Face Light */}
       <ellipse cx="150" cy="235" rx="12" ry="10" fill="#D49E75" />
       {/* Joey Eyes */}
       <circle cx="144" cy="230" r="2.5" fill="#000" />
       <circle cx="156" cy="230" r="2.5" fill="#000" />
       {/* Joey Nose */}
       <ellipse cx="150" cy="235" rx="4" ry="3" fill="#000" />
       
       {/* Joey Paws holding pouch */}
       <circle cx="125" cy="240" r="10" fill="#A06843" />
       <circle cx="175" cy="240" r="10" fill="#A06843" />
       
       {/* Pouch Rim Definition */}
       <path d="M120 250 Q 150 270, 180 250" fill="none" stroke="#BF8860" strokeWidth="2" />
    </g>
  </svg>
);

const DashboardHome = ({ stats, onOpenMenu, role }: any) => (
  <div className="space-y-8">
    {/* Welcome Banner with Custom Logo Branding */}
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
      {/* Colorful top strip matching logo palette */}
      <div className="h-3 w-full flex">
        <div className="h-full w-full bg-green-600"></div>
        <div className="h-full w-full bg-yellow-400"></div>
        <div className="h-full w-full bg-orange-500"></div>
        <div className="h-full w-full bg-pink-500"></div>
        <div className="h-full w-full bg-purple-600"></div>
        <div className="h-full w-full bg-blue-700"></div>
        <div className="h-full w-full bg-green-600"></div>
      </div>

      <div className="p-8 md:p-12 flex flex-col items-center text-center">
        
        {/* Logo Recreation based on PDF */}
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 mb-8">
            <div className="relative group">
                 {/* Glow effect */}
                <div className="absolute inset-0 bg-orange-100 rounded-full blur-2xl opacity-50 scale-110 group-hover:scale-125 transition-transform duration-700"></div>
                <KangarooLogo className="w-32 h-32 md:w-40 md:h-40 relative z-10 hover:-translate-y-1 transition-transform duration-300 drop-shadow-xl" />
            </div>
            
            <div className="flex flex-col items-center md:items-start">
                {/* Hand-crafted colorful text to match the logo image */}
                <div className="flex text-5xl md:text-7xl font-black tracking-tighter leading-none select-none drop-shadow-sm" style={{fontFamily: '"Arial Black", "Verdana", sans-serif'}}>
                    <span className="text-green-600 hover:text-green-500 transition-colors transform hover:scale-110 inline-block duration-200 cursor-default" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.1)' }}>K</span>
                    <span className="text-yellow-400 hover:text-yellow-300 transition-colors transform hover:scale-110 inline-block duration-200 cursor-default -ml-1" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.1)' }}>A</span>
                    <span className="text-orange-500 hover:text-orange-400 transition-colors transform hover:scale-110 inline-block duration-200 cursor-default -ml-1" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.1)' }}>N</span>
                    <span className="text-pink-500 hover:text-pink-400 transition-colors transform hover:scale-110 inline-block duration-200 cursor-default -ml-1" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.1)' }}>G</span>
                    <span className="text-pink-400 hover:text-pink-300 transition-colors transform hover:scale-110 inline-block duration-200 cursor-default -ml-1" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.1)' }}>A</span>
                    <span className="text-purple-600 hover:text-purple-500 transition-colors transform hover:scale-110 inline-block duration-200 cursor-default -ml-1" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.1)' }}>R</span>
                    <span className="text-blue-700 hover:text-blue-600 transition-colors transform hover:scale-110 inline-block duration-200 cursor-default -ml-1" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.1)' }}>O</span>
                    <span className="text-green-600 hover:text-green-500 transition-colors transform hover:scale-110 inline-block duration-200 cursor-default -ml-1" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.1)' }}>O</span>
                </div>
                <div className="text-blue-900 font-black tracking-widest text-sm md:text-lg mt-2 md:ml-1 uppercase" style={{ fontFamily: 'sans-serif' }}>
                    Sports and Learning House
                </div>
            </div>
        </div>

        <h1 className="text-lg md:text-xl font-medium text-gray-500 max-w-xl mx-auto mb-2">
          Bienvenidas a la plataforma de gestión de materiales e insumos
        </h1>
        
        <div className="md:hidden mt-8 w-full max-w-xs">
           <button 
             onClick={onOpenMenu}
             className="w-full flex justify-center items-center gap-2 bg-white border-2 border-orange-100 text-orange-600 px-6 py-3.5 rounded-2xl font-bold hover:bg-orange-50 hover:border-orange-200 transition-all shadow-sm"
           >
              <Menu size={20} />
              <span>Menú Principal</span>
           </button>
        </div>
      </div>
    </div>

    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 hover:shadow-md transition-shadow">
        <h3 className="text-gray-500 text-sm font-medium">Solicitudes Pendientes</h3>
        <p className="text-3xl font-bold text-orange-600 mt-2">{stats.activeRequests}</p>
      </div>
      
      {/* Solo la admin ve el stock bajo aquí */}
      {role === 'Administradora' ? (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 hover:shadow-md transition-shadow">
            <h3 className="text-gray-500 text-sm font-medium">Stock Bajo</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">{stats.lowStock}</p>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
            <h3 className="text-gray-500 text-sm font-medium">Solicitudes Aprobadas</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.approvedRequests}</p>
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-100 hover:shadow-md transition-shadow">
        <h3 className="text-gray-500 text-sm font-medium">Eventos Próximos</h3>
        <p className="text-3xl font-bold text-purple-600 mt-2">{stats.upcomingEvents}</p>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100 hover:shadow-md transition-shadow">
        <h3 className="text-gray-500 text-sm font-medium">Actividades Activas</h3>
        <p className="text-3xl font-bold text-amber-600 mt-2">{stats.activeActivities}</p>
      </div>
    </div>
  </div>
);

const Inventory = ({ materials }: any) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div className="p-6 border-b border-gray-100">
      <h2 className="text-xl font-bold text-gray-800">Inventario</h2>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
          <tr>
            <th className="p-4">Material</th>
            <th className="p-4">Categoría</th>
            <th className="p-4">Stock</th>
            <th className="p-4">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {materials.map((m: Material) => (
            <tr key={m.id} className="hover:bg-gray-50">
              <td className="p-4 font-medium text-gray-900">{m.name}</td>
              <td className="p-4 text-gray-500">{m.category}</td>
              <td className="p-4 font-medium">{m.stock} {m.unit}</td>
              <td className="p-4">
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${m.stock < m.minStock ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                  {m.stock < m.minStock ? 'Bajo Stock' : 'Disponible'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const ReportsStats = ({ materials, requests, activities, events }: { materials: Material[], requests: Request[], activities: Activity[], events: Event[] }) => {
    
    // 1. Consumo por semana (basado en la fecha de solicitud)
    const weeklyConsumption = useMemo(() => {
        const weeks: {[key: string]: number} = {};
        requests.forEach(req => {
            if (req.status === 'Entregado' || req.status === 'Pendiente') {
                // Obtener semana del año (aprox)
                const date = new Date(req.date);
                const weekNum = Math.ceil((date.getDate() - 1 + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7);
                const month = date.toLocaleString('es', { month: 'short' });
                const key = `${month} S${weekNum}`;
                
                const itemCount = req.items.reduce((acc, item) => acc + item.quantity, 0);
                weeks[key] = (weeks[key] || 0) + itemCount;
            }
        });
        return Object.entries(weeks).map(([name, items]) => ({ name, items }));
    }, [requests]);

    // 2. Artículos más usados
    const mostUsedItems = useMemo(() => {
        const itemCounts: {[key: string]: number} = {};
        requests.forEach(req => {
            req.items.forEach(item => {
                 itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
            });
        });
        return Object.entries(itemCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }, [requests]);

    // 3. Stock Bajo
    const lowStockItems = useMemo(() => {
        return materials.filter(m => m.stock <= m.minStock);
    }, [materials]);

    // 4. Actividades/Eventos con más insumos
    const topActivities = useMemo(() => {
        const activityCounts: {[key: string]: number} = {};
        
        requests.forEach(req => {
            let label = '';
            if (req.activityId) {
                const act = activities.find(a => a.id === req.activityId);
                if (act) label = `Act: ${act.title}`;
            } else if (req.eventId) {
                const ev = events.find(e => e.id === req.eventId);
                if (ev) label = `Evt: ${ev.title}`;
            }

            if (label) {
                const count = req.items.reduce((acc, i) => acc + i.quantity, 0);
                activityCounts[label] = (activityCounts[label] || 0) + count;
            }
        });

        return Object.entries(activityCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [requests, activities, events]);

    const COLORS = ['#F97316', '#A855F7', '#EAB308', '#3B82F6', '#EC4899'];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Reportes y Estadísticas</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Chart 1: Weekly Consumption */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <BarChart3 size={20} className="text-orange-500"/>
                        Consumo Semanal (Unidades)
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyConsumption}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{fill: '#FFF7ED'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                <Bar dataKey="items" fill="#F97316" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart 2: Top Activities */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <PieChartIcon size={20} className="text-purple-500"/>
                        Insumos por Actividad/Evento
                    </h3>
                    <div className="h-64 w-full flex items-center justify-center">
                        {topActivities.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={topActivities}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {topActivities.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-gray-400 text-sm italic">No hay datos suficientes</p>
                        )}
                    </div>
                </div>

                {/* List 1: Most Used Items */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                     <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <Target size={20} className="text-blue-500"/>
                        Top 5 Artículos Más Usados
                    </h3>
                    <div className="space-y-4">
                        {mostUsedItems.map((item, idx) => (
                            <div key={item.name} className="flex items-center gap-4">
                                <span className="font-bold text-gray-400 w-4 text-center">{idx + 1}</span>
                                <div className="flex-1">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-gray-700">{item.name}</span>
                                        <span className="font-bold text-gray-900">{item.count} u.</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-blue-500 rounded-full"
                                            style={{ width: `${(item.count / mostUsedItems[0].count) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Table: Low Stock */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100">
                     <h3 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">
                        <AlertCircle size={20} />
                        Alerta de Stock Bajo
                    </h3>
                    <div className="overflow-auto max-h-64">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-red-50 text-red-800 font-bold">
                                <tr>
                                    <th className="p-3 rounded-tl-lg">Artículo</th>
                                    <th className="p-3">Stock</th>
                                    <th className="p-3 rounded-tr-lg">Mínimo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {lowStockItems.length > 0 ? (
                                    lowStockItems.map(m => (
                                        <tr key={m.id}>
                                            <td className="p-3 font-medium text-gray-800">{m.name}</td>
                                            <td className="p-3 text-red-600 font-bold">{m.stock} {m.unit}</td>
                                            <td className="p-3 text-gray-500">{m.minStock}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="p-4 text-center text-gray-500 italic">Todo el stock está saludable</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

const NewRequest = ({ onSubmit, activities = [], events = [] }: any) => {
  const [title, setTitle] = useState('');
  const [room, setRoom] = useState('');
  const [selectedAssociationId, setSelectedAssociationId] = useState('');
  const [emailAlert, setEmailAlert] = useState(false);
  const [items, setItems] = useState<RequestItem[]>([
    { id: generateId(), name: '', quantity: 1, unit: 'Unidad', priority: false }
  ]);

  const handleAddItem = () => {
    setItems([...items, { id: generateId(), name: '', quantity: 1, unit: 'Unidad', priority: false }]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleItemChange = (id: string, field: keyof RequestItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleAssociationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedAssociationId(value);
    
    if (!value) {
        setRoom('');
        setTitle('');
        return;
    }

    // Check if it's an activity
    const activity = activities.find((a: any) => a.id === value);
    if (activity) {
      setRoom(activity.room);
      if (!title || title.startsWith('Materiales para')) {
        setTitle(`Materiales para Actividad: ${activity.title}`);
      }
      return;
    }

    // Check if it's an event
    const event = events.find((ev: any) => ev.id === value);
    if (event) {
      setRoom(event.room);
      if (!title || title.startsWith('Materiales para')) {
        setTitle(`Materiales para Evento: ${event.title}`);
      }
    }
  };

  const unitOptions = ['Unidad', 'Frasco', 'Set', 'Paquete', 'Caja', 'Otro'];

  // Validation now includes mandatory association
  const isValid = title.trim() !== '' && room.trim() !== '' && items.every(i => i.name.trim() !== '') && selectedAssociationId !== '';

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm max-w-4xl mx-auto border border-gray-100">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
         <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
            <PlusCircle size={24} />
         </div>
         <div>
           <h2 className="text-2xl font-bold text-gray-800">Nueva Solicitud</h2>
           <p className="text-gray-500 text-sm">Complete el formulario para solicitar materiales</p>
         </div>
      </div>

      <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-100">
          <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
            Asociar a Actividad o Evento <span className="text-red-500 font-normal text-xs">(Obligatorio)</span>
          </label>
          <select 
              value={selectedAssociationId} 
              onChange={handleAssociationChange}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-white"
          >
              <option value="">-- Seleccionar Actividad o Evento --</option>
              <optgroup label="Actividades">
                  {activities.map((a:any) => (
                      <option key={a.id} value={a.id}>{a.title} - {new Date(a.date).toLocaleDateString()} ({a.room})</option>
                  ))}
              </optgroup>
              <optgroup label="Eventos">
                  {events.map((e:any) => (
                      <option key={e.id} value={e.id}>{e.title} - {new Date(e.date).toLocaleDateString()} ({e.room})</option>
                  ))}
              </optgroup>
          </select>
          <p className="text-xs text-gray-500 mt-2">Seleccione la actividad o evento para autocompletar la sala y título.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Título de la solicitud</label>
          <input value={title} onChange={e => setTitle(e.target.value)} className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-gray-50 focus:bg-white" placeholder="Ej: Materiales para clase de arte" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Sala</label>
          <input value={room} onChange={e => setRoom(e.target.value)} className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-gray-50 focus:bg-white" placeholder="Ej: Aula 3" />
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
           <label className="block text-lg font-bold text-gray-800">Lista de Materiales</label>
           <button onClick={handleAddItem} className="text-sm flex items-center gap-1 text-orange-600 font-bold hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-colors">
             <PlusCircle size={16} />
             Agregar Ítem
           </button>
        </div>
        
        <div className="overflow-x-auto border border-gray-200 rounded-xl">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>
                <th className="p-4 font-bold w-5/12">Ítem / Material</th>
                <th className="p-4 font-bold w-2/12">Cantidad</th>
                <th className="p-4 font-bold w-3/12">Unidad</th>
                <th className="p-4 font-bold text-center w-1/12">Prioritario</th>
                <th className="p-4 font-bold text-center w-1/12">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {items.map((item) => (
                <tr key={item.id} className="group hover:bg-gray-50 transition-colors">
                  <td className="p-3">
                    <input 
                      type="text" 
                      value={item.name}
                      onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm"
                      placeholder="Nombre del material"
                    />
                  </td>
                  <td className="p-3">
                    <input 
                      type="number" 
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm"
                    />
                  </td>
                  <td className="p-3">
                    <select 
                      value={item.unit}
                      onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm bg-white"
                    >
                      {unitOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </td>
                  <td className="p-3 text-center align-middle">
                    <input 
                      type="checkbox" 
                      checked={item.priority}
                      onChange={(e) => handleItemChange(item.id, 'priority', e.target.checked)}
                      className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
                    />
                  </td>
                  <td className="p-3 text-center">
                    <button 
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <input
          type="checkbox"
          id="emailAlert"
          checked={emailAlert}
          onChange={(e) => setEmailAlert(e.target.checked)}
          className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
        />
        <label htmlFor="emailAlert" className="text-sm font-bold text-gray-700 cursor-pointer select-none flex items-center gap-2">
          <Bell size={16} className="text-orange-500"/>
          Avisar por mail cuando haya cambios de estado (Pendiente, En preparación, Entregado)
        </label>
      </div>

      <button 
        onClick={() => {
          if(isValid) {
              // Determine if activity or event
              const isActivity = activities.some((a: any) => a.id === selectedAssociationId);
              const payload = { 
                  title, 
                  requesterName: 'Ana López', 
                  date: new Date().toISOString().split('T')[0], 
                  items, 
                  emailAlert: emailAlert, 
                  room, 
                  activityId: isActivity ? selectedAssociationId : undefined,
                  eventId: !isActivity ? selectedAssociationId : undefined
              };
              onSubmit(payload);
          }
        }}
        disabled={!isValid}
        className={`w-full font-bold py-4 rounded-xl transition-all shadow-sm ${isValid ? 'bg-orange-500 hover:bg-orange-600 text-white hover:shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
      >
        Enviar Solicitud
      </button>
      {!isValid && selectedAssociationId === '' && (
          <p className="text-center text-red-500 text-sm mt-2">Debe asociar una actividad o evento obligatoriamente.</p>
      )}
    </div>
  );
};

const RequestList = ({ requests, onAddEvidence, activities = [], events = [] }: any) => {
  const fileInputRefs = useRef<{[key: string]: HTMLInputElement | null}>({});

  const handleFileClick = (id: string) => {
    fileInputRefs.current[id]?.click();
  };

  const handleFileChange = (id: string, event: any) => {
    const file = event.target.files[0];
    if (file) {
      onAddEvidence(id, file.name);
    }
  };

  const getActivityName = (id?: string) => {
    if (!id) return null;
    const activity = activities.find((a: any) => a.id === id);
    return activity ? activity.title : null;
  };

  const getEventName = (id?: string) => {
      if (!id) return null;
      const event = events.find((e: any) => e.id === id);
      return event ? event.title : null;
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'Pendiente': return 'bg-yellow-100 text-yellow-700';
          case 'En preparación': return 'bg-blue-100 text-blue-700';
          case 'Entregado': return 'bg-green-100 text-green-700';
          case 'Rechazado': return 'bg-red-100 text-red-700';
          default: return 'bg-gray-100 text-gray-700';
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Mis Solicitudes</h2>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 text-sm font-bold text-gray-500">
          Total: {requests.length}
        </div>
      </div>
      
      {requests.map((r: Request) => (
        <div key={r.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
          <div className="p-5 border-b border-gray-50 flex justify-between items-start bg-gray-50/50">
            <div>
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                {r.title}
                {r.items.some(i => i.priority) && (
                  <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1">
                    <AlertCircle size={10} /> Prioritario
                  </span>
                )}
                {r.emailAlert && (
                    <span className="bg-orange-100 text-orange-600 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1" title="Notificación por email activada">
                        <Bell size={10} /> Aviso Email
                    </span>
                )}
              </h3>
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center text-sm mt-1">
                <p className="text-gray-500 flex items-center gap-2">
                    <span>{new Date(r.date).toLocaleDateString()}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span>{r.room}</span>
                </p>
                {r.activityId && (
                   <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100 w-fit">
                      <LinkIcon size={10} />
                      Actividad: {getActivityName(r.activityId)}
                   </span>
                )}
                {r.eventId && (
                   <span className="flex items-center gap-1 text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100 w-fit">
                      <LinkIcon size={10} />
                      Evento: {getEventName(r.eventId)}
                   </span>
                )}
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(r.status)}`}>
              {r.status}
            </span>
          </div>
          
          <div className="p-5">
            <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Materiales Solicitados</h4>
            <div className="space-y-2 mb-6">
              {r.items.length > 0 ? (
                 <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                   {r.items.map((item: RequestItem) => (
                     <li key={item.id} className="text-sm text-gray-700 flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-100">
                        <span className="w-6 h-6 bg-white rounded flex items-center justify-center text-xs font-bold border border-gray-200 text-gray-500">{item.quantity}</span>
                        <span className="flex-1 font-medium">{item.name}</span>
                        <span className="text-xs text-gray-400 bg-white px-1.5 py-0.5 rounded border border-gray-100">{item.unit}</span>
                     </li>
                   ))}
                 </ul>
              ) : (
                <p className="text-sm text-gray-400 italic">No hay ítems detallados.</p>
              )}
            </div>

            <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <input 
                    type="file" 
                    ref={(el) => { fileInputRefs.current[r.id] = el; }}
                    className="hidden"
                    onChange={(e) => handleFileChange(r.id, e)}
                  />
                  
                  {r.evidence ? (
                    <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg border border-blue-100">
                      <Paperclip size={16} />
                      <span className="text-sm font-medium underline cursor-pointer">{r.evidence}</span>
                      <span className="text-xs text-blue-400 ml-1">(Evidencia adjunta)</span>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleFileClick(r.id)}
                      className="flex items-center gap-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Upload size={16} />
                      Adjuntar Evidencia
                    </button>
                  )}
               </div>
               
               <div className="text-xs text-gray-400">
                 ID: #{r.id}
               </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const EventForm = ({ onSubmit, onCancel }: any) => {
  const [formData, setFormData] = useState({
    title: '',
    responsible: '',
    room: ROOM_OPTIONS[0],
    date: '',
    description: '',
    evidence: ''
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: any) => {
      const file = e.target.files[0];
      if(file) {
          setFormData(prev => ({ ...prev, evidence: file.name }));
      }
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-purple-100 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Nuevo Evento</h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Nombre del evento</label>
            <input 
              name="title" 
              required 
              value={formData.title} 
              onChange={handleChange} 
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all bg-gray-50 focus:bg-white"
              placeholder="Ej: Fiesta de Navidad"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Responsable/s</label>
            <input 
              name="responsible" 
              required 
              value={formData.responsible} 
              onChange={handleChange} 
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all bg-gray-50 focus:bg-white"
              placeholder="Encargado del evento"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Sala / Ubicación</label>
            <select 
              name="room" 
              value={formData.room} 
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all bg-gray-50 focus:bg-white"
            >
              {ROOM_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Fecha del evento</label>
            <input 
              type="date" 
              name="date" 
              required 
              value={formData.date} 
              onChange={handleChange} 
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all bg-gray-50 focus:bg-white"
            />
          </div>
        </div>

        <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Descripción del evento</label>
            <textarea 
              name="description" 
              rows={3} 
              required
              value={formData.description} 
              onChange={handleChange} 
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all bg-gray-50 focus:bg-white"
              placeholder="Detalles del evento..."
            />
        </div>

        <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Evidencias del evento (Opcional)</label>
            <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 cursor-pointer transition-colors flex flex-col items-center justify-center gap-2"
            >
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                {formData.evidence ? (
                    <span className="text-purple-600 font-bold flex items-center gap-2">
                        <CheckCircle2 size={20} />
                        {formData.evidence}
                    </span>
                ) : (
                    <>
                        <Upload size={24} className="text-gray-400" />
                        <span className="text-gray-500 text-sm">Haga clic para adjuntar archivo o foto</span>
                    </>
                )}
            </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button 
            type="button" 
            onClick={onCancel} 
            className="px-6 py-2.5 text-gray-500 font-bold hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="px-6 py-2.5 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 shadow-sm hover:shadow transition-all"
          >
            Guardar Evento
          </button>
        </div>
      </form>
    </div>
  );
}

const Events = ({ events, onAddEvent, onUpdateEvent, onAddComment }: any) => {
  const [showForm, setShowForm] = useState(false);
  const [commentInputs, setCommentInputs] = useState<{[key: string]: any}>({});
  const fileInputRefs = useRef<{[key: string]: HTMLInputElement | null}>({});

  const handleCreate = (data: any) => {
    onAddEvent(data);
    setShowForm(false);
  };

  const handleFileClick = (id: string) => {
      fileInputRefs.current[id]?.click();
  };

  const handleFileChange = (id: string, event: any) => {
      const file = event.target.files[0];
      if (file) {
          // Find event and update evidence
          const eventToUpdate = events.find((e: Event) => e.id === id);
          if(eventToUpdate && onUpdateEvent) {
              onUpdateEvent({ ...eventToUpdate, evidence: file.name });
          }
      }
  };

  const handleCommentChange = (eventId: string, field: string, value: any) => {
    setCommentInputs(prev => ({
      ...prev,
      [eventId]: {
        ...prev[eventId],
        [field]: value
      }
    }));
  };

  const handleSubmitComment = (eventId: string) => {
    const input = commentInputs[eventId];
    if (!input || !input.text || !input.supportDate || !input.durationMinutes) return;

    onAddComment(eventId, {
      text: input.text,
      supportDate: input.supportDate,
      durationMinutes: parseInt(input.durationMinutes)
    });

    // Clear inputs
    setCommentInputs(prev => ({
      ...prev,
      [eventId]: { text: '', supportDate: '', durationMinutes: '' }
    }));
  };

  // Simple helper to calculate progress relative to today.
  // Assuming a start date of created roughly 30 days before event for visualization if no created_at
  const getProgress = (eventDateStr: string) => {
      const eventDate = new Date(eventDateStr);
      const today = new Date();
      // Mock start date as 30 days before event
      const startDate = new Date(eventDate);
      startDate.setDate(eventDate.getDate() - 30);
      
      const totalDuration = eventDate.getTime() - startDate.getTime();
      const elapsed = today.getTime() - startDate.getTime();
      
      let progress = (elapsed / totalDuration) * 100;
      if (progress < 0) progress = 0;
      if (progress > 100) progress = 100;
      
      return progress;
  };

  return (
    <div className="space-y-6">
      {!showForm && (
          <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div>
                  <h2 className="text-2xl font-bold text-gray-800">Calendario de Eventos</h2>
                  <p className="text-gray-500 mt-1">Programa y gestiona los eventos institucionales</p>
              </div>
              <button 
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-3 rounded-lg transition-all shadow-sm"
              >
                  <PlusCircle size={20} />
                  <span>Nuevo Evento</span>
              </button>
          </div>
      )}

      {showForm && <EventForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />}

      <div className="space-y-6">
        {events.map((e: Event) => {
          const progress = getProgress(e.date);
          const isPast = new Date(e.date) < new Date();

          return (
          <div key={e.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex flex-col md:flex-row gap-6">
                <div className="bg-purple-50 p-4 rounded-xl text-center min-w-[100px] flex flex-col justify-center items-center border border-purple-100">
                    <span className="block text-xs text-purple-600 uppercase font-bold mb-1">{new Date(e.date).toLocaleString('es', { month: 'short' })}</span>
                    <span className="block text-4xl font-black text-purple-700 leading-none mb-1">{new Date(e.date).getDate() + 1}</span>
                    <span className="block text-xs text-gray-400 font-medium">{new Date(e.date).getFullYear()}</span>
                </div>
                
                <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">{e.title}</h3>
                            <div className="flex flex-wrap items-center gap-3 mt-1">
                                <span className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                                    <MapPin size={12} /> {e.room}
                                </span>
                                {e.responsible && (
                                    <span className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                                        <User size={12} /> {e.responsible}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-50">
                        {e.description}
                    </p>

                    {/* Gantt / Progress Section */}
                    <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                        <div className="flex justify-between items-end mb-2">
                           <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Estado de Avance (Gantt)</h4>
                           <span className="text-xs font-bold text-purple-600">
                               {isPast ? 'Evento Finalizado' : `${Math.round(progress)}% Completado`}
                           </span>
                        </div>
                        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden relative">
                            <div 
                                className="h-full bg-purple-500 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-medium uppercase">
                            <span>Planificación</span>
                            <span>En Proceso</span>
                            <span>Evento</span>
                        </div>
                    </div>

                    <div className="pt-2 flex items-center gap-3">
                        <input 
                            type="file" 
                            ref={(el) => { fileInputRefs.current[e.id] = el; }}
                            className="hidden"
                            onChange={(ev) => handleFileChange(e.id, ev)}
                        />
                        {e.evidence ? (
                            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-100 text-sm font-bold">
                                <LinkIcon size={14} />
                                <span className="underline cursor-pointer">Ver Evidencia: {e.evidence}</span>
                            </div>
                        ) : (
                            <button 
                                onClick={() => handleFileClick(e.id)}
                                className="flex items-center gap-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-colors text-xs font-bold uppercase tracking-wide"
                            >
                                <Upload size={14} />
                                Adjuntar Evidencia
                            </button>
                        )}
                    </div>

                    {/* Comments / Support Section */}
                    <div className="border-t border-gray-100 pt-4 mt-4">
                        <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <MessageSquare size={16} className="text-purple-500"/>
                            Colaboraciones y Apoyo
                        </h4>
                        
                        <div className="space-y-3 mb-4">
                            {e.comments && e.comments.length > 0 ? (
                                e.comments.map(comment => (
                                    <div key={comment.id} className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 text-sm">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-bold text-blue-800">{comment.user}</span>
                                            <span className="text-xs text-gray-400">{comment.date}</span>
                                        </div>
                                        <p className="text-gray-700 mb-2">{comment.text}</p>
                                        <div className="flex gap-3 text-xs font-medium text-blue-600">
                                            <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-blue-100">
                                                <CalendarIcon size={10} /> Apoyo: {comment.supportDate}
                                            </span>
                                            <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-blue-100">
                                                <Timer size={10} /> Duración: {comment.durationMinutes} min
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-400 italic">Aún no hay colaboradores registrados.</p>
                            )}
                        </div>

                        {/* Add Comment Form */}
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <div className="mb-2">
                                <input 
                                    type="text" 
                                    className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="Comentario: Ej. Puedo ayudar en decoración..."
                                    value={commentInputs[e.id]?.text || ''}
                                    onChange={(ev) => handleCommentChange(e.id, 'text', ev.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <input 
                                    type="date" 
                                    className="flex-1 p-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-purple-500"
                                    value={commentInputs[e.id]?.supportDate || ''}
                                    onChange={(ev) => handleCommentChange(e.id, 'supportDate', ev.target.value)}
                                    title="Fecha de apoyo"
                                />
                                <input 
                                    type="number" 
                                    className="w-24 p-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-purple-500"
                                    placeholder="Min"
                                    value={commentInputs[e.id]?.durationMinutes || ''}
                                    onChange={(ev) => handleCommentChange(e.id, 'durationMinutes', ev.target.value)}
                                    title="Minutos de apoyo"
                                />
                                <button 
                                    onClick={() => handleSubmitComment(e.id)}
                                    disabled={!commentInputs[e.id]?.text || !commentInputs[e.id]?.supportDate}
                                    className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    Agregar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
          )
        })}
      </div>
    </div>
  );
};

const ActivityForm = ({ onSubmit, onCancel }: any) => {
  const [formData, setFormData] = useState<Omit<Activity, 'id' | 'status'>>({
    title: '',
    date: '',
    room: ROOM_OPTIONS[0],
    objectives: '',
    description: '',
    expectedLearnings: '',
    responsible: ''
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-amber-100 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Nueva Actividad Pedagógica</h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
      </div>
      
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Nombre de la Actividad</label>
            <input required name="title" value={formData.title} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-gray-50" placeholder="Ej: Taller de Arte" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Responsable</label>
            <input required name="responsible" value={formData.responsible} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-gray-50" placeholder="Educadora a cargo" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Sala</label>
            <select name="room" value={formData.room} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-gray-50">
              {ROOM_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Fecha</label>
            <input type="date" required name="date" value={formData.date} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-gray-50" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Objetivos de Aprendizaje</label>
          <textarea required name="objectives" rows={2} value={formData.objectives} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-gray-50" placeholder="¿Qué se busca lograr?" />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Descripción de la Experiencia</label>
          <textarea required name="description" rows={3} value={formData.description} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-gray-50" placeholder="Pasos de la actividad..." />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Aprendizajes Esperados</label>
          <textarea required name="expectedLearnings" rows={2} value={formData.expectedLearnings} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-gray-50" placeholder="Indicadores de logro..." />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button type="button" onClick={onCancel} className="px-6 py-2.5 text-gray-500 font-bold hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
          <button type="submit" className="px-6 py-2.5 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 shadow-sm">Guardar Actividad</button>
        </div>
      </form>
    </div>
  );
}

const Activities = ({ activities, onAddActivity, onUpdateStatus }: any) => {
  const [showForm, setShowForm] = useState(false);

  const handleCreate = (data: any) => {
    onAddActivity(data);
    setShowForm(false);
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'Programada': return 'bg-blue-100 text-blue-700';
          case 'Realizada': return 'bg-green-100 text-green-700';
          case 'Cancelada': return 'bg-red-100 text-red-700';
          default: return 'bg-gray-100 text-gray-700';
      }
  };

  return (
    <div className="space-y-6">
      {!showForm && (
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Planificación de Actividades</h2>
            <p className="text-gray-500 mt-1">Gestión de experiencias de aprendizaje</p>
          </div>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-3 rounded-lg transition-all shadow-sm">
            <PlusCircle size={20} />
            <span>Nueva Actividad</span>
          </button>
        </div>
      )}

      {showForm && <ActivityForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />}

      <div className="grid grid-cols-1 gap-6">
        {activities.map((a: Activity) => (
          <div key={a.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
               <div>
                   <h3 className="text-xl font-bold text-gray-900">{a.title}</h3>
                   <div className="flex flex-wrap gap-2 mt-1">
                       <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded flex items-center gap-1">
                          <User size={12} /> {a.responsible}
                       </span>
                       <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded flex items-center gap-1">
                          <MapPin size={12} /> {a.room}
                       </span>
                       <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded flex items-center gap-1">
                          <CalendarIcon size={12} /> {new Date(a.date).toLocaleDateString()}
                       </span>
                   </div>
               </div>
               <select 
                  value={a.status}
                  onChange={(e) => onUpdateStatus(a.id, e.target.value)}
                  className={`text-xs font-bold px-2 py-1 rounded-lg border-none outline-none cursor-pointer ${getStatusColor(a.status)}`}
               >
                   <option value="Programada">Programada</option>
                   <option value="Realizada">Realizada</option>
                   <option value="Cancelada">Cancelada</option>
               </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-100">
                    <h4 className="font-bold text-amber-700 mb-1 flex items-center gap-1"><Target size={14}/> Objetivos</h4>
                    <p className="text-gray-700">{a.objectives}</p>
                </div>
                <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                    <h4 className="font-bold text-blue-700 mb-1 flex items-center gap-1"><BookOpen size={14}/> Descripción</h4>
                    <p className="text-gray-700">{a.description}</p>
                </div>
                <div className="bg-green-50/50 p-3 rounded-lg border border-green-100">
                    <h4 className="font-bold text-green-700 mb-1 flex items-center gap-1"><ActivityIcon size={14}/> Aprendizajes</h4>
                    <p className="text-gray-700">{a.expectedLearnings}</p>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState<Role>('Administradora');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const [requests, setRequests] = useState<Request[]>(INITIAL_REQUESTS);
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);
  const [materials, setMaterials] = useState<Material[]>(INITIAL_MATERIALS);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleNewRequest = (data: any) => {
    const newReq: Request = {
      id: generateId(),
      status: 'Pendiente',
      role: userRole,
      ...data
    };
    setRequests([newReq, ...requests]);
    setActiveTab('my-requests');
  };

  const handleAddEvidence = (id: string, filename: string) => {
    setRequests(requests.map(r => r.id === id ? { ...r, evidence: filename } : r));
  };

  const handleAddEvent = (data: any) => {
    const newEvent: Event = {
      id: generateId(),
      comments: [],
      ...data
    };
    setEvents([...events, newEvent]);
  };

  const handleUpdateEvent = (updatedEvent: Event) => {
    setEvents(events.map(e => e.id === updatedEvent.id ? updatedEvent : e));
  };

  const handleAddEventComment = (eventId: string, commentData: any) => {
    setEvents(events.map(e => {
      if (e.id === eventId) {
        const newComment: EventComment = {
          id: generateId(),
          user: userRole === 'Administradora' ? 'Admin' : 'Educadora',
          date: new Date().toISOString().split('T')[0],
          ...commentData
        };
        return { ...e, comments: [...(e.comments || []), newComment] };
      }
      return e;
    }));
  };

  const handleAddActivity = (data: any) => {
    const newActivity: Activity = {
      id: generateId(),
      status: 'Programada',
      ...data
    };
    setActivities([...activities, newActivity]);
  };

  const handleUpdateActivityStatus = (id: string, status: string) => {
    setActivities(activities.map(a => a.id === id ? { ...a, status } : a));
  };

  const stats = {
    activeRequests: requests.filter(r => r.status === 'Pendiente').length,
    approvedRequests: requests.filter(r => r.status === 'Entregado').length,
    lowStock: materials.filter(m => m.stock < m.minStock).length,
    upcomingEvents: events.length,
    activeActivities: activities.filter(a => a.status === 'Programada').length
  };

  const NavButton = ({ id, icon: Icon, label, colorClass = "text-gray-600" }: any) => (
    <button
      onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
      className={`w-full flex items-center gap-3 px-6 py-4 transition-all duration-200 font-medium
        ${activeTab === id 
          ? 'bg-orange-50 text-orange-600 border-r-4 border-orange-500' 
          : `text-gray-500 hover:bg-gray-50 hover:${colorClass}`
        }`}
    >
      <Icon size={20} className={activeTab === id ? 'text-orange-600' : ''} />
      <span>{label}</span>
      {activeTab === id && <ChevronRight size={16} className="ml-auto" />}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-gray-900 flex flex-col md:flex-row">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 h-screen w-72 bg-white shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-30 transition-transform duration-300 ease-out flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-8 flex items-center gap-3 border-b border-gray-50">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 shadow-sm">
             <KangarooLogo className="w-8 h-8" />
          </div>
          <div>
            <h1 className="font-black text-lg tracking-tight text-gray-800 leading-none">KANGAROO</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sports & Learning</p>
          </div>
        </div>

        <nav className="flex-1 py-6 overflow-y-auto">
          <div className="px-6 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">General</div>
          <NavButton id="dashboard" icon={LayoutDashboard} label="Panel general" />
          
          {/* Académico Moved Up */}
          <div className="px-6 mt-8 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Académico</div>
          <NavButton id="events" icon={CalendarIcon} label="Eventos" colorClass="text-purple-600" />
          <NavButton id="activities" icon={FileText} label="Actividades" colorClass="text-amber-600" />
          
          {/* Gestión de materiales */}
          <div className="px-6 mt-8 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Gestión de materiales</div>
          <NavButton id="new-request" icon={PlusCircle} label="Nueva Solicitud" colorClass="text-orange-600" />
          <NavButton id="my-requests" icon={ClipboardList} label="Mis Solicitudes" />
          
          {/* Reportería - Inventory and Reports moved here */}
          {userRole === 'Administradora' && (
             <>
               <div className="px-6 mt-8 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Reportería</div>
               <NavButton id="inventory" icon={Box} label="Inventario" />
               <NavButton id="reports" icon={BarChart3} label="Reportes y Estadísticas" colorClass="text-blue-600"/>
             </>
          )}
          
        </nav>

        <div className="p-6 border-t border-gray-50">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 mb-4">
            <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center text-orange-700 font-bold">
                {userRole === 'Administradora' ? 'AD' : 'ED'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">Usuario Actual</p>
              <p className="text-xs text-gray-500 truncate">{userRole}</p>
            </div>
          </div>
          
          {/* Role Switcher for Demo Purposes */}
          <div className="bg-gray-100 rounded-lg p-2 flex items-center gap-2">
             <Shield size={16} className="text-gray-500 ml-2"/>
             <select 
                value={userRole}
                onChange={(e) => {
                    setUserRole(e.target.value as Role);
                    setActiveTab('dashboard'); // Reset tab to avoid access denied
                }}
                className="bg-transparent text-xs font-bold text-gray-600 border-none outline-none w-full cursor-pointer"
             >
                 <option value="Administradora">Modo Administradora</option>
                 <option value="Educadora">Modo Educadora</option>
             </select>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto flex flex-col">
        {!isOnline && (
          <div className="bg-red-500 text-white px-4 py-2 text-center text-sm font-bold flex items-center justify-center gap-2 sticky top-0 z-50">
            <WifiOff size={16} />
            Modo Offline: Sin conexión a internet
          </div>
        )}

        <header className="md:hidden bg-white p-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
           <div className="flex items-center gap-2">
              <KangarooLogo className="w-8 h-8" />
              <span className="font-bold text-gray-800">Kangaroo</span>
           </div>
           <button onClick={() => setSidebarOpen(true)} className="p-2 bg-gray-50 rounded-lg text-gray-600">
             <Menu size={24} />
           </button>
        </header>

        <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12 w-full">
          {activeTab === 'dashboard' && <DashboardHome stats={stats} onOpenMenu={() => setSidebarOpen(true)} role={userRole} />}
          {activeTab === 'inventory' && userRole === 'Administradora' && <Inventory materials={materials} />}
          {activeTab === 'reports' && userRole === 'Administradora' && <ReportsStats materials={materials} requests={requests} activities={activities} events={events} />}
          {activeTab === 'new-request' && <NewRequest onSubmit={handleNewRequest} activities={activities} events={events} />}
          {activeTab === 'my-requests' && <RequestList requests={requests} onAddEvidence={handleAddEvidence} activities={activities} events={events} />}
          {activeTab === 'events' && <Events events={events} onAddEvent={handleAddEvent} onUpdateEvent={handleUpdateEvent} onAddComment={handleAddEventComment} />}
          {activeTab === 'activities' && <Activities activities={activities} onAddActivity={handleAddActivity} onUpdateStatus={handleUpdateActivityStatus} />}
        </div>
      </main>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);