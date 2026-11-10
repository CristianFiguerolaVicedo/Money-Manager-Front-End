import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { LoaderCircle } from "lucide-react";
import Dashboard from "../components/Dashboard";
import Input from "../components/Input";
import Modal from "../components/Modal";
import ProfileImageSelector from "../components/ProfileImageSelector";
import AppContext from "../context/AppContext";
import useUser from "../hooks/useUser";
import axiosConfig from "../util/axiosConfig";
import { API_ENDPOINTS } from "../util/apiEndpoints";
import { clearToken } from "../util/auth";
import uploadProfileImage from "../util/uploadProfileImage";
import { getErrorMessage } from "../util/util";
import { PASSWORD_HINT, validatePassword } from "../util/validation";

const cardClass = "p-5 bg-white rounded-2xl border border-gray-200";
const primaryButton =
  "flex items-center gap-2 bg-violet-700 text-white px-4 py-2 rounded-lg hover:bg-violet-800 font-semibold hover:cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed";

const Spinner = () => <LoaderCircle className="w-4 h-4 animate-spin" />;

const memberSince = (createdAt) => {
  if (!createdAt) return null;
  const date = new Date(createdAt);
  return Number.isNaN(date.getTime())
    ? null
    : new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }).format(date);
};

// Name and photo
const PersonalDataCard = ({ user, setUser }) => {
  const [fullName, setFullName] = useState(user.fullName || "");
  const [currentUrl, setCurrentUrl] = useState(user.profileImageUrl || null);
  const [newPhoto, setNewPhoto] = useState(null);
  const [saving, setSaving] = useState(false);

  const changed =
    fullName.trim() !== (user.fullName || "") || newPhoto !== null || (currentUrl || null) !== (user.profileImageUrl || null);

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast.error("Escribe tu nombre");
      return;
    }
    setSaving(true);
    try {
      let profileImageUrl = currentUrl;
      if (newPhoto) {
        try {
          profileImageUrl = await uploadProfileImage(newPhoto);
        } catch {
          toast.error("No se ha podido subir la foto. Prueba con otra imagen");
          return;
        }
      }
      const response = await axiosConfig.put(API_ENDPOINTS.UPDATE_PROFILE, {
        fullName: fullName.trim(),
        profileImageUrl: profileImageUrl || null,
      });
      setUser(response.data);
      setCurrentUrl(response.data.profileImageUrl || null);
      setNewPhoto(null);
      toast.success("Perfil actualizado");
    } catch (error) {
      toast.error(getErrorMessage(error, "No se ha podido guardar el perfil"));
    } finally {
      setSaving(false);
    }
  };

  const since = memberSince(user.createdAt);

  return (
    <section className={cardClass} aria-labelledby="personal-data">
      <h2 id="personal-data" className="text-lg mb-5">Datos personales</h2>
      <ProfileImageSelector
        image={newPhoto}
        setImage={setNewPhoto}
        currentUrl={currentUrl}
        onRemoveCurrent={() => setCurrentUrl(null)}
      />
      <Input label="Nombre completo" value={fullName} onChange={({ target }) => setFullName(target.value)} placeholder="Tu nombre" type="text" />
      <Input label="Email" value={user.email || ""} onChange={() => {}} type="email" disabled />
      <p className="text-xs text-gray-500 -mt-2 mb-4">
        El email es tu usuario para iniciar sesión y no se puede cambiar.{since && ` Cuenta creada en ${since}.`}
      </p>
      <div className="flex justify-end">
        <button type="button" onClick={handleSave} disabled={saving || !changed} className={primaryButton}>
          {saving ? <><Spinner /> Guardando...</> : "Guardar cambios"}
        </button>
      </div>
    </section>
  );
};

const EMAIL_OPTIONS = [
  {
    key: "emailDailyReminder",
    field: "dailyReminder",
    title: "Recordatorio diario",
    description: "Por la tarde, solo los días en que no hayas apuntado nada.",
  },
  {
    key: "emailDailySummary",
    field: "dailySummary",
    title: "Resumen diario de gastos",
    description: "Por la noche, la lista de los gastos del día (si los hubo).",
  },
  {
    key: "emailMonthlyReport",
    field: "monthlyReport",
    title: "Informe mensual",
    description: "El día 1: ingresos, gastos, ahorro, categorías con más gasto y presupuestos del mes anterior.",
  },
];

const Toggle = ({ checked, onChange, disabled, labelledBy, describedBy }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-labelledby={labelledBy}
    aria-describedby={describedBy}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-300 ${
      checked ? "bg-purple-800" : "bg-gray-300"
    }`}
  >
    <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
  </button>
);

// Optional scheduled emails (all off until the user turns them on)
const EmailPreferencesCard = ({ user, setUser }) => {
  const [saving, setSaving] = useState(null);

  const handleToggle = async (option, value) => {
    setSaving(option.key);
    try {
      const response = await axiosConfig.put(API_ENDPOINTS.EMAIL_PREFERENCES, { [option.field]: value });
      setUser(response.data);
      toast.success(value ? `${option.title}: activado` : `${option.title}: desactivado`);
    } catch (error) {
      toast.error(getErrorMessage(error, "No se ha podido guardar la preferencia"));
    } finally {
      setSaving(null);
    }
  };

  return (
    <section className={cardClass} aria-labelledby="email-preferences">
      <h2 id="email-preferences" className="text-lg">Emails</h2>
      <p className="text-sm text-gray-500 mt-1 mb-4">Elige qué emails quieres recibir en {user.email}.</p>
      <ul className="divide-y divide-gray-100">
        {EMAIL_OPTIONS.map((option) => (
          <li key={option.key} className="flex items-center justify-between gap-4 py-3">
            <div>
              <p id={`${option.key}-title`} className="text-sm font-medium text-gray-800">{option.title}</p>
              <p id={`${option.key}-desc`} className="text-xs text-gray-500 mt-0.5">{option.description}</p>
            </div>
            <Toggle
              checked={Boolean(user[option.key])}
              onChange={(value) => handleToggle(option, value)}
              disabled={saving !== null}
              labelledBy={`${option.key}-title`}
              describedBy={`${option.key}-desc`}
            />
          </li>
        ))}
      </ul>
    </section>
  );
};

const emptyPasswords = { current: "", next: "", confirm: "" };

const PasswordCard = () => {
  const [form, setForm] = useState(emptyPasswords);
  const [saving, setSaving] = useState(false);
  const set = (key) => ({ target }) => setForm((prev) => ({ ...prev, [key]: target.value }));

  const handleSave = async () => {
    if (!form.current) return toast.error("Escribe tu contraseña actual");
    const error = validatePassword(form.next);
    if (error) return toast.error(error);
    if (form.next !== form.confirm) return toast.error("Las contraseñas nuevas no coinciden");

    setSaving(true);
    try {
      await axiosConfig.put(API_ENDPOINTS.CHANGE_PASSWORD, { currentPassword: form.current, newPassword: form.next });
      setForm(emptyPasswords);
      toast.success("Contraseña actualizada. Te hemos enviado un email de aviso.");
    } catch (err) {
      toast.error(getErrorMessage(err, "No se ha podido cambiar la contraseña"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={cardClass} aria-labelledby="change-password">
      <h2 id="change-password" className="text-lg mb-5">Cambiar contraseña</h2>
      <Input label="Contraseña actual" value={form.current} onChange={set("current")} placeholder="••••••••" type="password" />
      <Input label="Nueva contraseña" value={form.next} onChange={set("next")} placeholder="••••••••" type="password" />
      <Input label="Repite la nueva contraseña" value={form.confirm} onChange={set("confirm")} placeholder="••••••••" type="password" />
      <p className="text-xs text-gray-500 -mt-2 mb-4">{PASSWORD_HINT}</p>
      <div className="flex justify-end">
        <button type="button" onClick={handleSave} disabled={saving} className={primaryButton}>
          {saving ? <><Spinner /> Cambiando...</> : "Cambiar contraseña"}
        </button>
      </div>
    </section>
  );
};

const DeleteAccountCard = ({ onDeleted }) => {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const canDelete = password && confirmText.trim().toUpperCase() === "BORRAR";

  const close = () => {
    setOpen(false);
    setPassword("");
    setConfirmText("");
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axiosConfig.delete(API_ENDPOINTS.DELETE_ACCOUNT, { data: { password } });
      onDeleted();
    } catch (error) {
      toast.error(getErrorMessage(error, "No se ha podido borrar la cuenta"));
      setDeleting(false);
    }
  };

  return (
    <section className={`${cardClass} border-red-200`} aria-labelledby="delete-account">
      <h2 id="delete-account" className="text-lg text-red-800">Borrar cuenta</h2>
      <p className="text-sm text-gray-600 mt-2">
        Se borrarán tu cuenta, tus categorías y todos tus ingresos y gastos. No se puede deshacer.
      </p>
      <div className="flex justify-end mt-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="px-4 py-2 rounded-lg border border-red-300 text-red-800 font-semibold hover:bg-red-50 hover:cursor-pointer"
        >
          Borrar mi cuenta
        </button>
      </div>

      <Modal isOpen={open} onClose={close} title="Borrar cuenta">
        <p className="text-sm text-gray-700 mb-4">
          Esta acción borra <strong>todos tus datos</strong> para siempre. Para confirmarla, escribe tu contraseña y la palabra <strong>BORRAR</strong>.
        </p>
        <Input label="Contraseña" value={password} onChange={({ target }) => setPassword(target.value)} placeholder="••••••••" type="password" />
        <Input label='Escribe "BORRAR"' value={confirmText} onChange={({ target }) => setConfirmText(target.value)} placeholder="BORRAR" type="text" />
        <div className="flex justify-end gap-3">
          <button type="button" onClick={close} className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:cursor-pointer">
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={!canDelete || deleting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-800 text-white font-semibold hover:bg-red-700 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? <><Spinner /> Borrando...</> : "Borrar definitivamente"}
          </button>
        </div>
      </Modal>
    </section>
  );
};

const Profile = () => {
  useUser();
  const { user, setUser, clearUser } = useContext(AppContext);
  const navigate = useNavigate();

  const handleDeleted = () => {
    clearToken();
    clearUser();
    toast.success("Tu cuenta se ha borrado. ¡Gracias por usar Money Manager!", { duration: 6000 });
    navigate("/signup", { replace: true });
  };

  return (
    <Dashboard activeMenu="Profile">
      <div className="my-5 mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-800 mb-6">Mi perfil</h1>
        {!user ? (
          <div className="flex justify-center py-16 text-gray-400">
            <LoaderCircle className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {/* key: reset the form when the user data is replaced */}
            <PersonalDataCard key={`${user.id}-${user.updatedAt}`} user={user} setUser={setUser} />
            <EmailPreferencesCard user={user} setUser={setUser} />
            <PasswordCard />
            <DeleteAccountCard onDeleted={handleDeleted} />
          </div>
        )}
      </div>
    </Dashboard>
  );
};

export default Profile;
