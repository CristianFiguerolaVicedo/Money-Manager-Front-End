import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FileImage, FileText, LoaderCircle, Paperclip, Trash2 } from "lucide-react";
import axiosConfig from "../util/axiosConfig";
import { API_ENDPOINTS } from "../util/apiEndpoints";
import { getErrorMessage } from "../util/util";

export const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024;
export const MAX_ATTACHMENTS = 5;
const ACCEPT = "image/jpeg,image/png,image/webp,application/pdf";

const formatSize = (bytes) => (bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`);

// Opens a private attachment: it needs the auth token, so it is downloaded and shown from a blob URL
export const openAttachment = async (attachment) => {
  const tab = window.open("", "_blank");
  try {
    const response = await axiosConfig.get(API_ENDPOINTS.ATTACHMENT(attachment.id), { responseType: "blob" });
    const url = URL.createObjectURL(new Blob([response.data], { type: attachment.contentType }));
    if (tab) tab.location.href = url;
    else window.location.href = url;
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (error) {
    tab?.close();
    toast.error(getErrorMessage(error, "No se ha podido abrir el archivo"));
  }
};

// Upload one file to an existing income/expense
export const uploadAttachment = (type, transactionId, file) => {
  const form = new FormData();
  form.append("file", file);
  return axiosConfig.post(API_ENDPOINTS.ATTACHMENTS, form, { params: { type, transactionId } });
};

const FileIcon = ({ contentType }) =>
  contentType === "application/pdf" ? <FileText size={16} className="text-gray-500 shrink-0" /> : <FileImage size={16} className="text-gray-500 shrink-0" />;

/**
 * Receipts/invoices of a movement.
 * - Editing (transactionId set): lists, uploads and deletes right away.
 * - Adding: keeps the chosen files in `pending` (uploaded by the page after the movement is created).
 */
const AttachmentsField = ({ type, transactionId, pending = [], onPendingChange }) => {
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);
  const editing = Boolean(transactionId);

  useEffect(() => {
    if (!editing) return;
    axiosConfig
      .get(API_ENDPOINTS.ATTACHMENTS, { params: { type, transactionId } })
      .then((response) => setFiles(response.data || []))
      .catch(() => setFiles([]));
  }, [editing, type, transactionId]);

  const total = editing ? files.length : pending.length;

  const choose = async (fileList) => {
    const chosen = [...(fileList || [])];
    if (inputRef.current) inputRef.current.value = "";
    for (const file of chosen) {
      if (!ACCEPT.split(",").includes(file.type)) {
        toast.error(`«${file.name}» no es una imagen ni un PDF`);
        return;
      }
      if (file.size > MAX_ATTACHMENT_BYTES) {
        toast.error(`«${file.name}» pasa de 2 MB`);
        return;
      }
    }
    if (total + chosen.length > MAX_ATTACHMENTS) {
      toast.error(`Como mucho ${MAX_ATTACHMENTS} archivos por movimiento`);
      return;
    }
    if (!editing) {
      onPendingChange([...pending, ...chosen]);
      return;
    }
    setBusy(true);
    try {
      for (const file of chosen) {
        const response = await uploadAttachment(type, transactionId, file);
        setFiles((prev) => [...prev, response.data]);
      }
      toast.success(chosen.length === 1 ? "Archivo adjuntado" : "Archivos adjuntados");
    } catch (error) {
      toast.error(getErrorMessage(error, "No se ha podido adjuntar el archivo"));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (file, index) => {
    if (!editing) {
      onPendingChange(pending.filter((_, i) => i !== index));
      return;
    }
    try {
      await axiosConfig.delete(API_ENDPOINTS.ATTACHMENT(file.id));
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
    } catch (error) {
      toast.error(getErrorMessage(error, "No se ha podido borrar el archivo"));
    }
  };

  const list = editing
    ? files.map((f) => ({ key: f.id, name: f.filename, size: f.sizeBytes, contentType: f.contentType, file: f }))
    : pending.map((f, i) => ({ key: `${f.name}-${i}`, name: f.name, size: f.size, contentType: f.type, file: f }));

  return (
    <div className="mb-4">
      <p className="text-[13px] text-slate-800 mb-1">Tickets o facturas (opcional)</p>
      {list.length > 0 && (
        <ul className="mb-2 divide-y divide-gray-100 border border-gray-200 rounded-md">
          {list.map((item, index) => (
            <li key={item.key} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
              {editing ? (
                <button type="button" onClick={() => openAttachment(item.file)} className="flex items-center gap-2 min-w-0 text-purple-800 hover:underline cursor-pointer">
                  <FileIcon contentType={item.contentType} />
                  <span className="truncate">{item.name}</span>
                </button>
              ) : (
                <span className="flex items-center gap-2 min-w-0 text-gray-700">
                  <FileIcon contentType={item.contentType} />
                  <span className="truncate">{item.name}</span>
                </span>
              )}
              <span className="flex items-center gap-2 shrink-0 text-xs text-gray-500">
                {formatSize(item.size)}
                <button type="button" onClick={() => remove(item.file, index)} aria-label={`Quitar ${item.name}`} className="inline-flex items-center justify-center min-h-11 min-w-11 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-800 cursor-pointer">
                  <Trash2 size={16} />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
      {total < MAX_ATTACHMENTS && (
        <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-gray-300 text-sm text-gray-600 cursor-pointer hover:bg-gray-50 focus-within:ring-2 focus-within:ring-purple-300">
          {busy ? <LoaderCircle size={15} className="animate-spin" /> : <Paperclip size={15} />}
          Adjuntar imagen o PDF
          <input ref={inputRef} type="file" accept={ACCEPT} multiple className="sr-only" disabled={busy} onChange={(e) => choose(e.target.files)} />
        </label>
      )}
      <p className="text-xs text-gray-500 mt-1">JPG, PNG, WEBP o PDF de hasta 2 MB. Solo los ves tú.</p>
    </div>
  );
};

export default AttachmentsField;
