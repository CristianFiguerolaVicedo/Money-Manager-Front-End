import { Link } from "react-router-dom";
import { Info } from "lucide-react";

// Shown on the income/expense pages (and in their form) when there is no category of that type yet
const NoCategoriesNotice = ({ labels, compact = false }) => (
  <div className={`flex gap-3 rounded-xl border border-amber-200 bg-amber-50 ${compact ? "p-3" : "p-4"}`}>
    <Info className="w-5 h-5 shrink-0 text-amber-700 mt-0.5" />
    <div className="text-sm text-amber-900">
      <p>
        Para añadir {labels.many} primero necesitas al menos una <strong>categoría de {labels.many}</strong>.
      </p>
      <Link to="/category" className="inline-block mt-2 font-semibold underline">
        Crear una categoría
      </Link>
    </div>
  </div>
);

export default NoCategoriesNotice;
