import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import PrintReport from '@/components/PrintReport';
import { motion } from 'framer-motion';
import { apiFetch } from '@/lib/api';

import { Department, DEPARTMENTS, DEPARTMENT_NAMES, Student, FeedbackSubmission } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Users, CheckCircle, Clock, Building, Printer, Upload, Search } from 'lucide-react';

const CHART_COLORS = ['#1e5a9e', '#d4910d', '#16a34a', '#0891b2', '#7c3aed', '#e11d48'];

export default function AdminDashboard() {
  const { user, isLoading: isLoadingAuth } = useAuth();
  const [selectedDept, setSelectedDept] = useState<Department | 'ALL'>('ALL');
  const [showPrint, setShowPrint] = useState(false);
  const [printDept, setPrintDept] = useState<Department>('CE');
  const [searchRoll, setSearchRoll] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  const [analytics, setAnalytics] = useState<any>({
    total: 0,
    submitted: 0,
    pending: 0,
    deptStats: DEPARTMENTS.map(d => ({ department: d, submitted: 0, pending: 0, facilityAvg: 0, accomplishmentAvg: 0 })),
    departments: DEPARTMENTS
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [printFeedback, setPrintFeedback] = useState<any[]>([]);
  const [printDeptStudentCount, setPrintDeptStudentCount] = useState<number>(0);

  // Load real data from API
  useEffect(() => {
    async function load() {
      if (user?.role === 'admin') {
        try {
          const response = await apiFetch('/api/students');
          if (!response.ok) throw new Error('Failed to fetch students');
          const data = await response.json();

          if (!Array.isArray(data)) {
            console.error('API did not return an array of students:', data);
            setIsLoading(false);
            return;
          }

          setStudents(data);

          // Calculate basic analytics from the real student list
          const total = data.length;
          const submitted = data.filter(s => s.hasSubmitted).length;
          const pending = total - submitted;

          // Group by department for charts
          const deptMap: Record<string, { submitted: number, pending: number }> = {};
          DEPARTMENTS.forEach(d => deptMap[d] = { submitted: 0, pending: 0 });

          // Map full/variant department names from DB → short code
          const deptAliasMap: Record<string, string> = {
            // Civil
            'CIVIL ENGINEERING': 'CE', 'CIVIL': 'CE',
            // Mechanical
            'MECHANICAL ENGINEERING': 'ME', 'MECHANICAL': 'ME',
            // Mechanical Sandwich
            'MECHANICAL ENGINEERING (SANDWICH)': 'MES', 'MES': 'MES',
            // Automobile
            'AUTOMOBILE ENGINEERING': 'AE', 'AUTOMOBILE': 'AE',
            // R&AC
            'MECHANICAL ENGINEERING (R & AC)': 'RAC', 'REFRIGERATION AND AIR CONDITIONING': 'RAC', 'RAC': 'RAC',
            // Mechatronics
            'MECHATRONICS': 'MC', 'MC': 'MC',
            // ECE
            'ELECTRONICS AND COMMUNICATION': 'ECE', 'ELECTRONICS & COMMUNICATION ENGINEERING': 'ECE',
            // EEE
            'ELECTRICAL AND ELECTRONICS': 'EEE', 'ELECTRICAL & ELECTRONICS ENGINEERING': 'EEE',
            // Computer Engineering
            'COMPUTER TECHNOLOGY': 'CT', 'COMPUTER ENGINEERING': 'CT',
            // Textile
            'TEXTILE TECHNOLOGY': 'TT', 'TEXTILE': 'TT',
            // Printing
            'PRINTING TECHNOLOGY': 'PT', 'PRINTING': 'PT',
            // CCN
            'COMMUNICATION AND COMPUTER NETWORKING': 'CCN',
            'COMMUNICATION & COMPUTER NETWORKING': 'CCN',
            'COMPUTER COMMUNICATION NETWORKS': 'CCN',
            'CCN': 'CCN',
          };

          data.forEach(s => {
            let dept = (s.department || '').toUpperCase().trim();
            // Check for alias
            if (deptAliasMap[dept]) dept = deptAliasMap[dept];

            if (deptMap[dept as Department]) {
              if (s.hasSubmitted) deptMap[dept as Department].submitted++;
              else deptMap[dept as Department].pending++;
            } else {
              // Default to CT if unclear or other mapping failed
              if (s.hasSubmitted) deptMap['CT'].submitted++;
              else deptMap['CT'].pending++;
            }
          });

          const deptStats = Object.entries(deptMap).map(([dept, stats]) => ({
            department: dept,
            submitted: stats.submitted,
            pending: stats.pending,
            facilityAvg: 0,
            accomplishmentAvg: 0
          }));

          setAnalytics({
            total: data.length,
            submitted,
            pending,
            deptStats,
            departments: DEPARTMENTS
          });

          setIsLoading(false);
        } catch (err) {
          console.error('Failed to load students:', err);
          setIsLoading(false);
        }
      }
    }
    if (user?.role === 'admin') {
      load();
    } else if (!isLoadingAuth) {
      setIsLoading(false);
    }
  }, [user, isLoadingAuth]);

  useEffect(() => {
    if (showPrint && user?.role === 'admin') {
      apiFetch(`/api/feedback/${printDept}`)
        .then(res => res.json())
        .then(f => {
          if (Array.isArray(f)) {
            setPrintFeedback(f);
          } else {
            console.error('Expected array for feedback but got:', f);
            setPrintFeedback([]);
          }
        })
        .catch(err => {
          console.error('Failed to load feedback for report:', err);
          setPrintFeedback([]);
        });
    }
  }, [showPrint, printDept, user]);

  const handlePrint = (dept: Department) => {
    // Count enrolled students for this specific department from DB
    const deptAliasMap: Record<string, string> = {
      'CIVIL ENGINEERING': 'CE', 'CIVIL': 'CE',
      'MECHANICAL ENGINEERING': 'ME', 'MECHANICAL': 'ME',
      'MECHANICAL ENGINEERING (SANDWICH)': 'MES', 'MES': 'MES',
      'AUTOMOBILE ENGINEERING': 'AE', 'AUTOMOBILE': 'AE',
      'MECHANICAL ENGINEERING (R & AC)': 'RAC', 'REFRIGERATION AND AIR CONDITIONING': 'RAC', 'RAC': 'RAC',
      'MECHATRONICS': 'MC', 'MC': 'MC',
      'ELECTRONICS AND COMMUNICATION': 'ECE', 'ELECTRONICS & COMMUNICATION ENGINEERING': 'ECE',
      'ELECTRICAL AND ELECTRONICS': 'EEE', 'ELECTRICAL & ELECTRONICS ENGINEERING': 'EEE',
      'COMPUTER TECHNOLOGY': 'CT', 'COMPUTER ENGINEERING': 'CT',
      'TEXTILE TECHNOLOGY': 'TT', 'TEXTILE': 'TT',
      'PRINTING TECHNOLOGY': 'PT', 'PRINTING': 'PT',
      'COMMUNICATION AND COMPUTER NETWORKING': 'CCN',
      'COMMUNICATION & COMPUTER NETWORKING': 'CCN',
      'COMPUTER COMMUNICATION NETWORKS': 'CCN', 'CCN': 'CCN',
    };
    const count = students.filter(s => {
      const d = (s.department || '').toUpperCase().trim();
      return d === dept || deptAliasMap[d] === dept;
    }).length;
    setPrintDeptStudentCount(count);
    setPrintDept(dept);
    setShowPrint(true);
    setTimeout(() => window.print(), 500);
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    alert('Excel upload requires Lovable Cloud backend. Currently running without backend support.');
  };

  // Rule of Hooks: All hooks and logic must come before early returns
  const filteredStudents = students.filter(s => {
    const sName = s.name || '';
    const sRoll = s.rollNo || '';
    const matchDept = selectedDept === 'ALL' || s.department === selectedDept;
    const matchSearch = !searchRoll ||
      sRoll.toLowerCase().includes(searchRoll.toLowerCase()) ||
      sName.toLowerCase().includes(searchRoll.toLowerCase());
    return matchDept && matchSearch;
  });

  const deptChartData = (analytics.deptStats || []).map((d: any) => ({
    name: d.department,
    submitted: d.submitted || 0,
    pending: d.pending || 0,
    avgFacility: d.facilityAvg || 0,
    avgAccomplishment: d.accomplishmentAvg || 0,
  }));

  const pieData = [
    { name: 'Submitted', value: analytics.submitted || 0 },
    { name: 'Pending', value: analytics.pending || 0 },
  ];

  // Logic to handle refresh: Wait for isLoadingAuth to finish before checking user
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="relative w-24 h-24 mb-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-4 border-dashed border-primary/40 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 border-2 border-primary/60 rounded-full border-t-transparent"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-8 bg-primary rounded-full shadow-[0_0_20px_rgba(30,90,158,0.5)]"
          />
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-primary-foreground font-display font-medium tracking-widest uppercase text-xs"
        >
          Security Check...
        </motion.p>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="relative scale-150 mb-12">
          {/* Outer Ring */}
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{ rotate: { duration: 8, repeat: Infinity, ease: "linear" }, scale: { duration: 2, repeat: Infinity } }}
            className="w-32 h-32 rounded-full border-[1px] border-primary/20 flex items-center justify-center"
          >
            <div className="absolute top-0 w-2 h-2 bg-primary rounded-full" />
          </motion.div>

          {/* Middle Pulse */}
          <motion.div
            animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 m-auto w-24 h-24 rounded-full bg-primary/10 border border-primary/30"
          />

          {/* Inner Core */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 m-auto w-16 h-16 rounded-full border-2 border-t-primary border-r-transparent border-b-primary/40 border-l-transparent flex items-center justify-center"
          >
            <motion.div
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_#1e5a9e]"
            />
          </motion.div>
        </div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center"
        >
          <h2 className="text-2xl font-display font-bold text-slate-900 tracking-tight">Accessing Dashboard</h2>
          <div className="flex items-center justify-center gap-1 mt-3">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                className="w-1 h-1 bg-primary rounded-full"
              />
            ))}
          </div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-4">Syncing Infrastructure</p>
        </motion.div>
      </div>
    );
  }



  if (showPrint) {
    return (
      <div>
        <div className="no-print p-4 bg-card border-b flex items-center gap-4">
          <button onClick={() => setShowPrint(false)} className="px-4 py-2 rounded-lg border text-foreground hover:bg-muted">← Back</button>
          <span className="text-sm text-muted-foreground">Press Ctrl+P to save as PDF</span>
        </div>
        <PrintReport department={printDept} feedback={printFeedback} totalStudents={printDeptStudentCount} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Students', value: analytics.total, icon: Users, color: 'text-primary' },
            { label: 'Submitted', value: analytics.submitted, icon: CheckCircle, color: 'text-success' },
            { label: 'Pending', value: analytics.pending, icon: Clock, color: 'text-accent' },
            { label: 'Departments', value: analytics.departments.length, icon: Building, color: 'text-info' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="stat-card bg-card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-display font-bold text-foreground mt-1">{stat.value}</p>
                </div>
                <stat.icon className={stat.color} size={32} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="lg:col-span-2 bg-card rounded-2xl border p-6">
            <h3 className="font-display font-bold text-foreground mb-4">Department-wise Submissions</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deptChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="submitted" fill="#1e5a9e" name="Submitted" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" fill="#d4910d" name="Pending" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="bg-card rounded-2xl border p-6">
            <h3 className="font-display font-bold text-foreground mb-4">Submission Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Actions Row */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value as Department | 'ALL')}
            className="px-4 py-2.5 rounded-lg border bg-card text-foreground text-sm"
          >
            <option value="ALL">All Departments</option>
            {DEPARTMENTS.map(d => (
              <option key={d} value={d}>{DEPARTMENT_NAMES[d]}</option>
            ))}
          </select>

          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchRoll}
              onChange={e => setSearchRoll(e.target.value)}
              placeholder="Search by roll no or name..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Upload Excel */}
          <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg border bg-card text-foreground text-sm cursor-pointer hover:bg-muted transition-colors">
            <Upload size={16} />
            Upload Excel
            <input type="file" accept=".xlsx,.xls" onChange={handleExcelUpload} className="hidden" />
          </label>

          {/* Print Reports */}
          {DEPARTMENTS.map(d => (
            <button
              key={d}
              onClick={() => handlePrint(d)}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              <Printer size={14} />
              {d}
            </button>
          ))}
        </div>

        {/* Students Table */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="bg-card rounded-2xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primary text-primary-foreground">
                  <th className="p-3 text-left">Roll No</th>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Department</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s, i) => (
                  <tr key={s.rollNo} className={i % 2 === 0 ? 'bg-card' : 'bg-muted/30'}>
                    <td className="p-3 font-medium text-foreground">{s.rollNo}</td>
                    <td className="p-3 text-foreground">{s.name}</td>
                    <td className="p-3 text-foreground">{s.department}</td>
                    <td className="p-3 text-center">
                      {s.hasSubmitted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                          <CheckCircle size={12} /> Submitted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
                          <Clock size={12} /> Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground">No students found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
