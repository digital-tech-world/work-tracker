interface StatCardProps {
  title: string;
  value: number | string;
  icon: string;
  bgColor: string;
  textColor: string;
}

const StatCard = ({ title, value, icon, bgColor, textColor }: StatCardProps) => {
  return (
    <div className={`${bgColor} rounded-lg p-4 flex-1 flex flex-col items-center`}>
      {/* Icon placeholder */}
      <div className="mb-3 h-8 w-8 flex items-center justify-center rounded-full 
                bg-white/50">
        <span className="material-icons">{icon}</span>
      </div>
      
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className={`mt-2 text-2xl font-bold ${textColor}`}>{value}</p>
    </div>
  );
};

export default StatCard;
