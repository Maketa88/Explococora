import React from 'react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import { 
  Package, 
  Users, 
  CreditCard,
  DollarSign,
  ArrowUp
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const Dashboard = () => {
  // Datos de ejemplo para el gráfico
  const data = [
    { name: 'Ene', total: 1200 },
    { name: 'Feb', total: 2100 },
    { name: 'Mar', total: 800 },
    { name: 'Abr', total: 1600 },
    { name: 'May', total: 900 },
    { name: 'Jun', total: 1700 },
  ];

  // Datos para las tarjetas
  const cardData = [
    {
      title: "Total Productos",
      number: "25,154",
      icon: <Package className="h-6 w-6" />,
      percentage: "25%"
    },
    {
      title: "Total Ventas",
      number: "$16,000",
      icon: <DollarSign className="h-6 w-6" />,
      percentage: "12%"
    },
    {
      title: "Total Clientes",
      number: "15,400",
      icon: <Users className="h-6 w-6" />,
      percentage: "15%"
    },
    {
      title: "Total Órdenes",
      number: "12,340",
      icon: <CreditCard className="h-6 w-6" />,
      percentage: "19%"
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cardData.map((card, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  {card.icon}
                </div>
                <span className="flex items-center gap-1 text-green-500">
                  <ArrowUp className="h-4 w-4" />
                  {card.percentage}
                </span>
              </div>
              <h3 className="text-gray-500 text-sm">{card.title}</h3>
              <p className="text-2xl font-semibold">{card.number}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Resumen de Ventas</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#4361ee" 
                    fill="#4361ee" 
                    fillOpacity={0.2} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Ventas Recientes</h2>
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div>
                      <p className="font-semibold">Cliente {item}</p>
                      <p className="text-sm text-gray-500">cliente{item}@email.com</p>
                    </div>
                  </div>
                  <p className="font-semibold">${Math.floor(Math.random() * 1000) + 500}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard; 