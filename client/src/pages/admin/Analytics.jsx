import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  getFullAnalytics, getOccupancyStats, getComplaintStats,
  getMessBillStats, getAttendanceTrend, getGatePassStats
} from '../../services/analyticsService';
import PageLayout from '../../components/common/PageLayout';
import Loader from '../../components/common/Loader';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  RadialBarChart, RadialBar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  FiUsers, FiTrendingUp, FiTrendingDown, FiHome,
  FiCreditCard, FiAlertCircle, FiLogOut, FiCalendar,
  FiRefreshCw, FiActivity, FiPercent, FiClock
} from 'react-icons/fi';
import { LuBedDouble } from 'react-icons/lu';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const COLORS = {
  primary:  '#4f46e5',
  success:  '#16a34a',
  warning:  '#d97706',
  danger:   '#dc2626',
  info:     '#0891b2',
  purple:   '#7c3aed',
  pink:     '#db2777',
  slate:    '#475569',
};

const PIE_COLORS  = [COLORS.primary, COLORS.success, COLORS.warning, COLORS.danger, COLORS.info, COLORS.purple];
const AREA_COLORS = [COLORS.primary, COLORS.success, COLORS.warning];

// ─── CUSTOM TOOLTIP ───────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label, prefix = '', suffix = '' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 shadow-xl text-xs">
      {label && <p className="text-gray-500 dark:text-gray-400 mb-1.5 font-medium">{label}</p>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color || p.fill }} />
          <span className="text-gray-600 dark:text-gray-300">{p.name}:</span>
          <span className="font-bold text-gray-900 dark:text-white">
            {prefix}{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}{suffix}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── KPI CARD ─────────────────────────────────────────────────────────────────
const KpiCard = ({ title, value, subtitle, icon: Icon, iconColor, iconBg, trend, trendValue, prefix = '', suffix = '' }) => {
  const isPositive = trend === 'up';
  const TrendIcon = isPositive ? FiTrendingUp : FiTrendingDown;

  return (
    <div className="
      bg-white dark:bg-gray-900
      border border-gray-200 dark:border-gray-800
      rounded-2xl p-5 shadow-sm
      hover:shadow-md dark:hover:shadow-black/30
      hover:-translate-y-0.5
      transition-all duration-200 group
    ">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${iconBg} transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-3`}>
          <Icon size={18} className={iconColor} />
        </div>
        {trendValue !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
            isPositive
              ? 'bg-success/10 text-success'
              : 'bg-danger/10 text-danger'
          }`}>
            <TrendIcon size={10} />
            {trendValue}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mb-0.5 tabular-nums">
        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
      </p>
      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
  );
};

// ─── SECTION WRAPPER ──────────────────────────────────────────────────────────
const Section = ({ title, subtitle, children, action }) => (
  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
    <div className="flex items-start justify-between mb-5">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
        {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
    {children}
  </div>
);

// ─── PILL LEGEND ──────────────────────────────────────────────────────────────
const PillLegend = ({ data, colors }) => (
  <div className="flex flex-wrap gap-2 mt-3">
    {data.map((d, i) => (
      <div key={d._id || d.name} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
        <div className="w-2.5 h-2.5 rounded-sm" style={{ background: colors[i % colors.length] }} />
        <span className="capitalize">{d._id || d.name}</span>
        <span className="font-semibold text-gray-700 dark:text-gray-300">({d.count ?? d.value})</span>
      </div>
    ))}
  </div>
);

// ─── EMPTY CHART STATE ────────────────────────────────────────────────────────
const ChartEmpty = ({ message = 'No data yet' }) => (
  <div className="flex items-center justify-center h-full text-gray-300 dark:text-gray-600 text-xs">
    {message}
  </div>
);

// ─── RADIAL GAUGE ─────────────────────────────────────────────────────────────
const OccupancyGauge = ({ value, total }) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const gaugeData = [{ name: 'Occupied', value: pct }, { name: 'Free', value: 100 - pct }];
  const color = pct > 85 ? COLORS.danger : pct > 60 ? COLORS.warning : COLORS.success;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <ResponsiveContainer width={160} height={160}>
          <RadialBarChart
            cx="50%" cy="50%"
            innerRadius="65%" outerRadius="90%"
            startAngle={210} endAngle={-30}
            data={gaugeData}
          >
            <RadialBar dataKey="value" cornerRadius={6} background={{ fill: '#f3f4f6' }}>
              {gaugeData.map((_, i) => (
                <Cell key={i} fill={i === 0 ? color : 'transparent'} />
              ))}
            </RadialBar>
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold tabular-nums" style={{ color }}>{pct}%</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">occupied</span>
        </div>
      </div>
      <div className="flex gap-4 text-xs mt-1">
        <div className="text-center">
          <p className="font-bold text-gray-900 dark:text-white text-base tabular-nums">{value}</p>
          <p className="text-gray-400">Occupied</p>
        </div>
        <div className="w-px bg-gray-200 dark:bg-gray-700" />
        <div className="text-center">
          <p className="font-bold text-gray-900 dark:text-white text-base tabular-nums">{total - value}</p>
          <p className="text-gray-400">Available</p>
        </div>
        <div className="w-px bg-gray-200 dark:bg-gray-700" />
        <div className="text-center">
          <p className="font-bold text-gray-900 dark:text-white text-base tabular-nums">{total}</p>
          <p className="text-gray-400">Total</p>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────────
const Analytics = () => {
  const { token } = useAuth();
  const { isDark } = useTheme();
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [full, setFull]           = useState(null);
  const [occupancy, setOccupancy] = useState(null);
  const [complaints, setComplaints] = useState(null);
  const [billing, setBilling]     = useState(null);
  const [trend, setTrend]         = useState([]);
  const [gatepass, setGatepass]   = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError]         = useState('');

  const fetchAll = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [fullRes, occRes, compRes, billRes, trendRes, gpRes] = await Promise.all([
        getFullAnalytics(token),
        getOccupancyStats(token),
        getComplaintStats(token),
        getMessBillStats(token),
        getAttendanceTrend(token),
        getGatePassStats(token),
      ]);
      setFull(fullRes.data);
      setOccupancy(occRes.data);
      setComplaints(compRes.data);
      setBilling(billRes.data);
      setTrend(trendRes.data.trend);
      setGatepass(gpRes.data);
    } catch {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchAll(); }, [token]);

  // Reshape attendance trend: [{date, present, absent, late}]
  const trendShaped = useMemo(() => {
    if (!trend.length) return [];
    const byDate = {};
    trend.forEach(({ _id: { date, status }, count }) => {
      if (!byDate[date]) byDate[date] = { date: date.slice(5) }; // "MM-DD"
      byDate[date][status] = count;
    });
    return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
  }, [trend]);

  // Reshape billing by month for area chart
  const billingMonths = useMemo(() => {
    if (!billing?.byMonth) return [];
    return billing.byMonth.map(m => ({
      month: m._id,
      collected: m.totalCollected,
      outstanding: m.totalOutstanding,
    }));
  }, [billing]);

  // Pie data helpers
  const occupancyPie = useMemo(() =>
    (occupancy?.byStatus || []).map(d => ({ name: d._id, value: d.count }))
  , [occupancy]);

  const complaintPie = useMemo(() =>
    (complaints?.byCategory || []).map(d => ({ name: d._id, value: d.count }))
  , [complaints]);

  const billStatusPie = useMemo(() =>
    (billing?.byStatus || []).map(d => ({ name: d._id, value: d.count }))
  , [billing]);

  const gatepassPie = useMemo(() =>
    (gatepass?.byStatus || []).map(d => ({ name: d._id, value: d.count }))
  , [gatepass]);

  const chartTickColor = isDark ? '#cbd5e1' : '#94a3b8';
  const chartLabelColor = isDark ? '#d1d5db' : '#64748b';
  const chartGridColor = isDark ? '#334155' : '#f1f5f9';
  const rowHoverClass = isDark ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50';
  const buttonHoverClass = isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50';
  const tabActiveClass = isDark
    ? 'bg-gray-900 text-white shadow-sm'
    : 'bg-white text-gray-900 shadow-sm';
  const tabInactiveClass = isDark
    ? 'text-gray-400 hover:text-gray-200'
    : 'text-gray-500 hover:text-gray-700';

  const TABS = [
    { id: 'overview',    label: 'Overview' },
    { id: 'occupancy',   label: 'Rooms' },
    { id: 'billing',     label: 'Billing' },
    { id: 'attendance',  label: 'Attendance' },
    { id: 'complaints',  label: 'Complaints' },
  ];

  if (loading) return (
    <PageLayout>
      <div className="flex items-center justify-center h-full">
        <Loader text="Loading analytics..." />
      </div>
    </PageLayout>
  );

  if (error) return (
    <PageLayout>
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <FiActivity size={32} className="text-gray-300 dark:text-gray-600" />
        <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
        <button
          onClick={() => fetchAll()}
          className="text-xs text-primary hover:underline"
        >
          Try again
        </button>
      </div>
    </PageLayout>
  );

  const occupancyPct = occupancy?.utilization?.totalCapacity > 0
    ? Math.round((occupancy.utilization.totalOccupied / occupancy.utilization.totalCapacity) * 100)
    : 0;

  return (
    <PageLayout>
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Live hostel metrics · updated just now
          </p>
        </div>
        <button
          onClick={() => fetchAll(true)}
          disabled={refreshing}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl ${buttonHoverClass} transition-all disabled:opacity-50`}
        >
          <FiRefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* ── Tab Bar ──────────────────────────────────────────────────────── */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6 w-fit">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 ${
              activeTab === tab.id
                ? tabActiveClass
                : tabInactiveClass
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          OVERVIEW TAB
      ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div className="space-y-5">

          {/* KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Total Students"
              value={full?.totalStudents ?? 0}
              subtitle="Registered residents"
              icon={FiUsers}
              iconColor="text-primary"
              iconBg="bg-primary-light dark:bg-primary/20"
            />
            <KpiCard
              title="Occupancy Rate"
              value={occupancyPct}
              subtitle={`${occupancy?.utilization?.totalOccupied ?? 0} of ${occupancy?.utilization?.totalCapacity ?? 0} beds`}
              icon={FiPercent}
              iconColor={occupancyPct > 85 ? 'text-danger' : occupancyPct > 60 ? 'text-warning' : 'text-success'}
              iconBg={occupancyPct > 85 ? 'bg-danger-light dark:bg-danger/20' : occupancyPct > 60 ? 'bg-warning-light dark:bg-warning/20' : 'bg-success-light dark:bg-success/20'}
              suffix="%"
            />
            <KpiCard
              title="Avg Resolution"
              value={complaints?.avgResolutionHours ? complaints.avgResolutionHours.toFixed(1) : '—'}
              subtitle="Hours per complaint"
              icon={FiClock}
              iconColor="text-info"
              iconBg="bg-info/10 dark:bg-info/20"
              suffix={complaints?.avgResolutionHours ? 'h' : ''}
            />
            <KpiCard
              title="Staff Members"
              value={(full?.totalWardens ?? 0) + 1}
              subtitle={`${full?.totalWardens ?? 0} wardens + 1 admin`}
              icon={FiActivity}
              iconColor="text-purple"
              iconBg="bg-purple-100 dark:bg-purple-900/30"
            />
          </div>

          {/* Row 2: Occupancy gauge + attendance area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            <Section title="Room Occupancy" subtitle="Current capacity utilization">
              <div className="flex flex-col items-center pt-2">
                <OccupancyGauge
                  value={occupancy?.utilization?.totalOccupied ?? 0}
                  total={occupancy?.utilization?.totalCapacity ?? 0}
                />
              </div>
            </Section>

            <div className="lg:col-span-2">
              <Section title="Attendance — Last 7 Days" subtitle="Daily check-in breakdown">
                <ResponsiveContainer width="100%" height={200}>
                  {trendShaped.length > 0 ? (
                    <AreaChart data={trendShaped} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                      <defs>
                        {['present', 'absent', 'late'].map((key, i) => (
                          <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor={AREA_COLORS[i]} stopOpacity={0.25} />
                            <stop offset="95%" stopColor={AREA_COLORS[i]} stopOpacity={0} />
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} strokeOpacity={0.6} />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: chartTickColor }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: chartTickColor }} axisLine={false} tickLine={false} width={24} />
                      <Tooltip content={<ChartTooltip />} cursor={false} />
                      {['present', 'absent', 'late'].map((key, i) => (
                        <Area
                          key={key}
                          type="monotone"
                          dataKey={key}
                          name={key}
                          stroke={AREA_COLORS[i]}
                          strokeWidth={2}
                          fill={`url(#grad-${key})`}
                          dot={{ r: 3, fill: AREA_COLORS[i], strokeWidth: 0 }}
                          activeDot={{ r: 5, strokeWidth: 0 }}
                        />
                      ))}
                    </AreaChart>
                  ) : <ChartEmpty message="No attendance data yet" />}
                </ResponsiveContainer>
                <PillLegend
                  data={['present','absent','late'].map(k => ({ _id: k, count: trendShaped.reduce((s,d) => s + (d[k] || 0), 0) }))}
                  colors={AREA_COLORS}
                />
              </Section>
            </div>
          </div>

          {/* Row 3: complaints + gate passes + billing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            <Section title="Complaints by Category" subtitle="Total filed">
              <ResponsiveContainer width="100%" height={180}>
                {complaintPie.length > 0 ? (
                  <PieChart>
                    <Pie
                      data={complaintPie}
                      cx="50%" cy="50%"
                      innerRadius={48} outerRadius={72}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {complaintPie.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} cursor={false} />
                  </PieChart>
                ) : <ChartEmpty />}
              </ResponsiveContainer>
              <PillLegend data={complaintPie.map(d => ({ _id: d.name, count: d.value }))} colors={PIE_COLORS} />
            </Section>

            <Section title="Gate Pass Status" subtitle="All time">
              <ResponsiveContainer width="100%" height={180}>
                {gatepassPie.length > 0 ? (
                  <PieChart>
                    <Pie
                      data={gatepassPie}
                      cx="50%" cy="50%"
                      innerRadius={48} outerRadius={72}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {gatepassPie.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} cursor={false} />
                  </PieChart>
                ) : <ChartEmpty />}
              </ResponsiveContainer>
              <PillLegend data={gatepassPie.map(d => ({ _id: d.name, count: d.value }))} colors={PIE_COLORS} />
            </Section>

            <Section title="Mess Bill Status" subtitle="By count">
              <ResponsiveContainer width="100%" height={180}>
                {billStatusPie.length > 0 ? (
                  <PieChart>
                    <Pie
                      data={billStatusPie}
                      cx="50%" cy="50%"
                      innerRadius={48} outerRadius={72}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {billStatusPie.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} cursor={false} />
                  </PieChart>
                ) : <ChartEmpty />}
              </ResponsiveContainer>
              <PillLegend data={billStatusPie.map(d => ({ _id: d.name, count: d.value }))} colors={PIE_COLORS} />
            </Section>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          OCCUPANCY TAB
      ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'occupancy' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Total Rooms" value={occupancy?.byStatus?.reduce((s,d) => s + d.count, 0) ?? 0}
              icon={LuBedDouble} iconColor="text-primary" iconBg="bg-primary-light dark:bg-primary/20" />
            <KpiCard title="Available" value={occupancy?.byStatus?.find(d => d._id === 'available')?.count ?? 0}
              icon={FiHome} iconColor="text-success" iconBg="bg-success-light dark:bg-success/20" />
            <KpiCard title="Full" value={occupancy?.byStatus?.find(d => d._id === 'full')?.count ?? 0}
              icon={FiAlertCircle} iconColor="text-danger" iconBg="bg-danger-light dark:bg-danger/20" />
            <KpiCard title="Maintenance" value={occupancy?.byStatus?.find(d => d._id === 'maintenance')?.count ?? 0}
              icon={FiActivity} iconColor="text-warning" iconBg="bg-warning-light dark:bg-warning/20" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Section title="Rooms by Status" subtitle="Current distribution">
              <div className="flex items-center justify-center py-4">
                <OccupancyGauge
                  value={occupancy?.utilization?.totalOccupied ?? 0}
                  total={occupancy?.utilization?.totalCapacity ?? 0}
                />
              </div>
            </Section>

            <Section title="Rooms by Type" subtitle="Single / Double / Triple breakdown">
              <ResponsiveContainer width="100%" height={220}>
                {(occupancy?.byType?.length ?? 0) > 0 ? (
                  <BarChart
                    data={occupancy.byType.map(d => ({
                      name: d._id,
                      rooms: d.count,
                      capacity: d.totalCapacity,
                    }))}
                    margin={{ top: 5, right: 10, bottom: 5, left: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: chartTickColor }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: chartTickColor }} axisLine={false} tickLine={false} width={28} />
                    <Tooltip content={<ChartTooltip />} cursor={false} />
                    <Bar dataKey="rooms" name="Rooms" fill={COLORS.primary} radius={[6, 6, 0, 0]} maxBarSize={56} />
                    <Bar dataKey="capacity" name="Capacity" fill={COLORS.success} radius={[6, 6, 0, 0]} maxBarSize={56} />
                  </BarChart>
                ) : <ChartEmpty />}
              </ResponsiveContainer>
            </Section>
          </div>

          {/* Room status detail table */}
          <Section title="Capacity Breakdown" subtitle="Beds used vs total">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    {['Type', 'Rooms', 'Total Beds', 'Occupied', 'Utilization'].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider first:pl-0">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {(occupancy?.byType ?? []).map(row => {
                    const util = row.totalCapacity > 0
                      ? Math.round((row.count / row.totalCapacity) * 100)
                      : 0;
                    return (
                      <tr key={row._id} className={`${rowHoverClass} transition-colors`}>
                        <td className="py-3 px-4 first:pl-0 font-medium text-gray-900 dark:text-white capitalize">{row._id}</td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300 tabular-nums">{row.count}</td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300 tabular-nums">{row.totalCapacity}</td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300 tabular-nums">—</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${util}%`,
                                  background: util > 80 ? COLORS.danger : util > 50 ? COLORS.warning : COLORS.success
                                }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 w-10 tabular-nums">{util}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Section>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          BILLING TAB
      ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'billing' && (
        <div className="space-y-5">
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {(billing?.byStatus ?? []).map((d, i) => {
              const icons = { paid: FiTrendingUp, unpaid: FiCreditCard, overdue: FiAlertCircle, pending_verification: FiClock };
              const colors = {
                paid:                { icon: 'text-success', bg: 'bg-success-light dark:bg-success/20' },
                unpaid:              { icon: 'text-warning',  bg: 'bg-warning-light dark:bg-warning/20' },
                overdue:             { icon: 'text-danger',   bg: 'bg-danger-light dark:bg-danger/20' },
                pending_verification:{ icon: 'text-primary',  bg: 'bg-primary-light dark:bg-primary/20' },
              };
              const Icon = icons[d._id] || FiCreditCard;
              const c = colors[d._id] || { icon: 'text-gray-500', bg: 'bg-gray-100' };
              return (
                <KpiCard
                  key={d._id}
                  title={d._id.replace('_', ' ')}
                  value={d.count}
                  subtitle={`₹${(d.amount ?? 0).toLocaleString()} total`}
                  icon={Icon}
                  iconColor={c.icon}
                  iconBg={c.bg}
                  prefix=""
                />
              );
            })}
          </div>

          {/* Monthly revenue area chart */}
          <Section
            title="Collection Trend"
            subtitle="Collected vs outstanding by month"
          >
            <ResponsiveContainer width="100%" height={260}>
              {billingMonths.length > 0 ? (
                <AreaChart data={billingMonths} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                  <defs>
                    <linearGradient id="gradCollected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={COLORS.success} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={COLORS.success} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradOutstanding" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={COLORS.danger} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={COLORS.danger} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} strokeOpacity={0.6} vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: chartTickColor }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: chartTickColor }} axisLine={false} tickLine={false} width={50}
                    tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<ChartTooltip prefix="₹" />} cursor={false} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="collected" name="Collected"
                    stroke={COLORS.success} strokeWidth={2} fill="url(#gradCollected)"
                    dot={{ r: 3, fill: COLORS.success, strokeWidth: 0 }} />
                  <Area type="monotone" dataKey="outstanding" name="Outstanding"
                    stroke={COLORS.danger} strokeWidth={2} fill="url(#gradOutstanding)"
                    dot={{ r: 3, fill: COLORS.danger, strokeWidth: 0 }} />
                </AreaChart>
              ) : <ChartEmpty message="No billing data yet — generate bills to see the trend" />}
            </ResponsiveContainer>
          </Section>

          {/* Monthly billing table */}
          {billingMonths.length > 0 && (
            <Section title="Month-by-Month Summary">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      {['Month', 'Total Billed', 'Collected', 'Outstanding', 'Collection Rate'].map(h => (
                        <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider first:pl-0">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {(billing?.byMonth ?? []).map(m => {
                      const rate = m.totalBilled > 0
                        ? Math.round((m.totalCollected / m.totalBilled) * 100)
                        : 0;
                      return (
                        <tr key={m._id} className={`${rowHoverClass} transition-colors`}>
                          <td className="py-3 px-4 first:pl-0 font-medium text-gray-900 dark:text-white">{m._id}</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-300 tabular-nums">₹{m.totalBilled.toLocaleString()}</td>
                          <td className="py-3 px-4 text-success font-semibold tabular-nums">₹{m.totalCollected.toLocaleString()}</td>
                          <td className="py-3 px-4 text-danger font-semibold tabular-nums">₹{m.totalOutstanding.toLocaleString()}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${rate}%`,
                                    background: rate > 80 ? COLORS.success : rate > 50 ? COLORS.warning : COLORS.danger
                                  }}
                                />
                              </div>
                              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 w-10 tabular-nums">{rate}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Section>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          ATTENDANCE TAB
      ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'attendance' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {['present', 'absent', 'late'].map((key, i) => {
              const total = trendShaped.reduce((s, d) => s + (d[key] || 0), 0);
              const icons = { present: FiCalendar, absent: FiAlertCircle, late: FiClock };
              const colors = {
                present: { icon: 'text-success', bg: 'bg-success-light dark:bg-success/20' },
                absent:  { icon: 'text-danger',  bg: 'bg-danger-light dark:bg-danger/20' },
                late:    { icon: 'text-warning',  bg: 'bg-warning-light dark:bg-warning/20' },
              };
              return (
                <KpiCard key={key}
                  title={key.charAt(0).toUpperCase() + key.slice(1)}
                  value={total}
                  subtitle="Last 7 days total"
                  icon={icons[key]}
                  iconColor={colors[key].icon}
                  iconBg={colors[key].bg}
                />
              );
            })}
          </div>

          <Section title="Daily Attendance Breakdown" subtitle="Last 7 days">
            <ResponsiveContainer width="100%" height={280}>
              {trendShaped.length > 0 ? (
                <BarChart data={trendShaped} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: chartTickColor }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: chartTickColor }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip content={<ChartTooltip />} cursor={false} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="present" name="Present" stackId="a" fill={COLORS.success} radius={[0, 0, 0, 0]} maxBarSize={48} />
                  <Bar dataKey="late"    name="Late"    stackId="a" fill={COLORS.warning} radius={[0, 0, 0, 0]} maxBarSize={48} />
                  <Bar dataKey="absent"  name="Absent"  stackId="a" fill={COLORS.danger}  radius={[4, 4, 0, 0]} maxBarSize={48} />
                </BarChart>
              ) : <ChartEmpty message="No attendance recorded yet" />}
            </ResponsiveContainer>
          </Section>

          {/* Heatmap-style day grid */}
          {trendShaped.length > 0 && (
            <Section title="Presence Rate by Day" subtitle="% of students present">
              <div className="flex flex-wrap gap-3 pt-2">
                {trendShaped.map(day => {
                  const total = (day.present || 0) + (day.absent || 0) + (day.late || 0);
                  const pct = total > 0 ? Math.round(((day.present || 0) + (day.late || 0)) / total * 100) : 0;
                  const bg = pct > 80 ? 'bg-success' : pct > 50 ? 'bg-warning' : 'bg-danger';
                  return (
                    <div key={day.date} className="flex flex-col items-center gap-1">
                      <div
                        className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center text-white text-xs font-bold tabular-nums`}
                        style={{ opacity: 0.5 + pct / 200 }}
                        title={`${day.date}: ${pct}% present`}
                      >
                        {pct}%
                      </div>
                      <span className="text-[10px] text-gray-400">{day.date}</span>
                    </div>
                  );
                })}
              </div>
            </Section>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          COMPLAINTS TAB
      ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'complaints' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {(complaints?.byStatus ?? []).map(d => {
              const config = {
                open:        { icon: FiAlertCircle, iconColor: 'text-warning',  iconBg: 'bg-warning-light dark:bg-warning/20' },
                'in-progress':{ icon: FiActivity,   iconColor: 'text-primary',  iconBg: 'bg-primary-light dark:bg-primary/20' },
                resolved:    { icon: FiTrendingUp,  iconColor: 'text-success',  iconBg: 'bg-success-light dark:bg-success/20' },
              }[d._id] || { icon: FiAlertCircle, iconColor: 'text-gray-500', iconBg: 'bg-gray-100' };
              return (
                <KpiCard key={d._id}
                  title={d._id}
                  value={d.count}
                  subtitle="complaints"
                  {...config}
                />
              );
            })}
            <KpiCard
              title="Avg Resolution"
              value={complaints?.avgResolutionHours?.toFixed(1) ?? '—'}
              subtitle="hours per complaint"
              icon={FiClock}
              iconColor="text-info"
              iconBg="bg-info/10 dark:bg-info/20"
              suffix={complaints?.avgResolutionHours ? 'h' : ''}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Section title="By Category" subtitle="Complaint distribution">
              <ResponsiveContainer width="100%" height={220}>
                {complaintPie.length > 0 ? (
                  <BarChart
                    data={complaintPie.map(d => ({ name: d.name, count: d.value }))}
                    layout="vertical"
                    margin={{ top: 0, right: 20, bottom: 0, left: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: chartTickColor }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: chartLabelColor }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} cursor={false} />
                    <Bar dataKey="count" name="Complaints" radius={[0, 6, 6, 0]} maxBarSize={28}>
                      {complaintPie.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                ) : <ChartEmpty />}
              </ResponsiveContainer>
            </Section>

            <Section title="By Status" subtitle="Resolution pipeline">
              <ResponsiveContainer width="100%" height={220}>
                {(complaints?.byStatus?.length ?? 0) > 0 ? (
                  <PieChart>
                    <Pie
                      data={complaints.byStatus.map(d => ({ name: d._id, value: d.count }))}
                      cx="50%" cy="50%"
                      innerRadius={55} outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {complaints.byStatus.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} cursor={false} />
                  </PieChart>
                ) : <ChartEmpty />}
              </ResponsiveContainer>
              {(complaints?.byStatus?.length ?? 0) > 0 && (
                <PillLegend
                  data={(complaints?.byStatus ?? []).map(d => ({ _id: d._id, count: d.count }))}
                  colors={PIE_COLORS}
                />
              )}
            </Section>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default Analytics;