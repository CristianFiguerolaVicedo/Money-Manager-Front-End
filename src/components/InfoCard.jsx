// Headline figure of the dashboard: small icon chip, label, and the amount as the dominant element
const InfoCard = ({ icon, label, value, color }) => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200">
      <div className="flex items-center gap-2.5">
        <span className={`w-8 h-8 flex items-center justify-center text-white ${color} rounded-lg [&>svg]:w-4 [&>svg]:h-4`} aria-hidden="true">
          {icon}
        </span>
        <h2 className="text-sm font-medium text-gray-600">{label}</h2>
      </div>
      <p className="mt-3 text-[28px] leading-none font-semibold tracking-tight text-gray-900 tabular-nums">{value}</p>
    </div>
  );
};

export default InfoCard;
