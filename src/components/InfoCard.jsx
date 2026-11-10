// Headline figure of the dashboard: label with a small icon, and the amount as the dominant element.
// tone colours only the icon (income green, expense coral-red); the card itself stays neutral.
const TONES = {
  neutral: "bg-gray-100 text-gray-700",
  income: "bg-green-50 text-green-700",
  expense: "bg-red-50 text-red-700",
};

const InfoCard = ({ icon, label, value, tone = "neutral" }) => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200">
      <div className="flex items-center gap-2.5">
        <span className={`w-8 h-8 flex items-center justify-center rounded-lg ${TONES[tone] || TONES.neutral} [&>svg]:w-4 [&>svg]:h-4`} aria-hidden="true">
          {icon}
        </span>
        <h2 className="text-sm font-medium text-gray-600">{label}</h2>
      </div>
      <p className="mt-3 text-[28px] leading-none font-semibold tracking-tight text-gray-900">{value}</p>
    </div>
  );
};

export default InfoCard;
