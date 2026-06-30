import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const BarChart = ({ data, dataKey = 'count', nameKey = '_id', barColor = '#4f46e5', height = 250 }) => {
  if (!data || data.length === 0) return <p>No data available</p>;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReBarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={nameKey} />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Bar dataKey={dataKey} fill={barColor} />
      </ReBarChart>
    </ResponsiveContainer>
  );
};

export default BarChart;