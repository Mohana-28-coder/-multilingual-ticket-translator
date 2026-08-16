import React from 'react';
import { FiInbox, FiClock, FiCheckCircle, FiAlertCircle, FiGlobe, FiTrendingUp } from 'react-icons/fi';

const KPICards = ({ kpiData }) => {
  const cards = [
    {
      label: 'Total Tickets',
      value: kpiData?.total_tickets || 0,
      icon: <FiInbox />,
      color: 'blue',
    },
    {
      label: 'Today',
      value: kpiData?.tickets_today || 0,
      icon: <FiTrendingUp />,
      color: 'cyan',
    },
    {
      label: 'Pending',
      value: kpiData?.pending_tickets || 0,
      icon: <FiAlertCircle />,
      color: 'yellow',
    },
    {
      label: 'Resolved',
      value: kpiData?.resolved_tickets || 0,
      icon: <FiCheckCircle />,
      color: 'green',
    },
    {
      label: 'Awaiting Translation',
      value: kpiData?.awaiting_translation || 0,
      icon: <FiGlobe />,
      color: 'purple',
    },
    {
      label: 'Avg. Resolution',
      value: kpiData?.average_resolution_time 
        ? `${kpiData.average_resolution_time}h`
        : 'N/A',
      icon: <FiClock />,
      color: 'red',
    },
  ];

  return (
    <div className="kpi-grid">
      {cards.map((card, index) => (
        <div key={index} className="kpi-card">
          <div className="kpi-header">
            <div className={`kpi-icon ${card.color}`}>
              {card.icon}
            </div>
          </div>
          <div className="kpi-value">{card.value}</div>
          <div className="kpi-label">{card.label}</div>
        </div>
      ))}
    </div>
  );
};

export default KPICards;