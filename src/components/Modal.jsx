import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Accessible dialog (A11): labelled by its title, focus moves inside and stays there (Tab cycles),
// Escape closes it, and focus goes back to whatever opened it.
const Modal = ({ children, isOpen, onClose, title }) => {
  const titleId = useId();
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;
    const opener = document.activeElement;
    const dialog = dialogRef.current;
    // First field if there is one, otherwise the dialog itself
    const first = dialog?.querySelector("input, select, textarea") || dialog;
    first?.focus();

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current?.();
        return;
      }
      if (e.key !== "Tab" || !dialog) return;
      const items = [...dialog.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
      if (items.length === 0) return;
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstItem) {
        e.preventDefault();
        lastItem.focus();
      } else if (!e.shiftKey && document.activeElement === lastItem) {
        e.preventDefault();
        firstItem.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (opener && typeof opener.focus === "function" && document.contains(opener)) opener.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center items-center w-full h-full overflow-hidden bg-black/50"
      onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} className="relative p-2 sm:p-4 w-full max-w-2xl focus:outline-none">
        <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col max-h-[calc(100dvh-1rem)] sm:max-h-[90vh]">
          <div className="flex items-center justify-between px-5 py-4 md:px-6 border-b border-gray-100 shrink-0">
            <h2 id={titleId} className="text-lg font-semibold text-gray-900">
              {title}
            </h2>
            <button
              onClick={onClose}
              type="button"
              aria-label="Cerrar"
              className="text-gray-500 hover:bg-gray-100 hover:text-gray-800 rounded-lg w-9 h-9 flex justify-center items-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
          <div className="px-5 py-5 md:px-6 text-gray-700 overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
