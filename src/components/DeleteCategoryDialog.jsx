import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import axiosConfig from "../util/axiosConfig";
import { API_ENDPOINTS } from "../util/apiEndpoints";
import { getErrorMessage } from "../util/util";

// Deletes a category. If the backend answers 409 (it still has incomes/expenses),
// asks where to move them and retries with ?reassignTo=.
const DeleteCategoryDialog = ({ category, categories, onDeleted, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [inUseCount, setInUseCount] = useState(null);
  const [targetId, setTargetId] = useState("");

  const sameTypeOptions = categories.filter(
    (c) => c.id !== category.id && c.type?.toLowerCase() === category.type?.toLowerCase()
  );

  const handleDelete = async () => {
    setLoading(true);
    setError("");
    try {
      await axiosConfig.delete(API_ENDPOINTS.DELETE_CATEGORY(category.id), {
        params: inUseCount ? { reassignTo: targetId } : undefined,
      });
      onDeleted();
    } catch (err) {
      if (err.response?.status === 409 && err.response.data?.transactionCount != null) {
        setInUseCount(err.response.data.transactionCount);
        setTargetId(sameTypeOptions[0]?.id ?? "");
      } else {
        setError(getErrorMessage(err, "No se ha podido borrar la categoría"));
      }
    } finally {
      setLoading(false);
    }
  };

  const typeLabel = category.type?.toLowerCase() === "income" ? "ingresos" : "gastos";
  const blocked = inUseCount && sameTypeOptions.length === 0;

  return (
    <div className="space-y-4">
      {!inUseCount ? (
        <p className="text-sm">
          ¿Seguro que quieres borrar la categoría <strong>{category.name}</strong>?
        </p>
      ) : blocked ? (
        <p className="text-sm">
          <strong>{category.name}</strong> tiene {inUseCount} movimiento(s) y no hay otra categoría de{" "}
          {typeLabel} a la que moverlos. Crea otra categoría de {typeLabel} primero.
        </p>
      ) : (
        <>
          <p className="text-sm">
            <strong>{category.name}</strong> tiene {inUseCount} movimiento(s). Elige a qué categoría moverlos
            antes de borrarla:
          </p>
          <label className="block">
            <span className="text-[13px] text-slate-800">Mover los movimientos a</span>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:border-blue-500"
            >
              {sameTypeOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </>
      )}

      {error && <p className="text-red-800 text-sm bg-red-50 p-2 rounded">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
        >
          Cancelar
        </button>
        {!blocked && (
          <button
            type="button"
            disabled={loading || (inUseCount && !targetId)}
            onClick={handleDelete}
            className="flex items-center gap-1 bg-red-700 text-white px-3 py-2 rounded-lg hover:bg-red-600 font-semibold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading && <LoaderCircle className="w-4 h-4 animate-spin" />}
            {inUseCount ? "Mover y borrar" : "Borrar"}
          </button>
        )}
      </div>
    </div>
  );
};

export default DeleteCategoryDialog;
