import { ChevronLeft, ChevronRight, LoaderCircle, Search } from "lucide-react";
import Dashboard from "../components/Dashboard";
import useUser from "../hooks/useUser";
import { useEffect, useMemo, useState } from "react";
import axiosConfig from "../util/axiosConfig";
import { API_ENDPOINTS } from "../util/apiEndpoints";
import toast from "react-hot-toast";
import TransactionInfoCard from "../components/TransactionInfoCard";
import { getErrorMessage, formatDate, formatCurrency } from "../util/util";
import { categoryOptions } from "../util/categories";

const PAGE_SIZE = 20;

const Filter = () => {
    useUser();

    const [type, setType] = useState("all");
    const [categoryId, setCategoryId] = useState("");
    const [minAmount, setMinAmount] = useState("");
    const [maxAmount, setMaxAmount] = useState("");
    const [categories, setCategories] = useState([]);
    const [formError, setFormError] = useState(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [keyword, setKeyword] = useState("");
    const [sortField, setSortField] = useState("date");
    const [sortOrder, setSortOrder] = useState("asc");
    const [transactions, setTransactions] = useState([]);
    // Type of the results currently shown (may differ from the select until the next search)
    const [resultType, setResultType] = useState("all");
    const [hasSearched, setHasSearched] = useState(false);
    const [loading, setLoading] = useState(false);
    // Filters of the results on screen (paging keeps them even if the form was edited afterwards)
    const [lastQuery, setLastQuery] = useState(null);
    const [pageInfo, setPageInfo] = useState({ page: 0, totalItems: 0, totalPages: 0, totalAmount: 0 });

    useEffect(() => {
        axiosConfig.get(API_ENDPOINTS.GET_ALL_CATEGORIES)
            .then((response) => setCategories(response.data || []))
            .catch(() => setCategories([]));
    }, []);

    // With "Todos" every category is offered; otherwise only those of the chosen type (subcategories indented)
    const categoryChoices = useMemo(() => [
        { value: "", label: "Todas" },
        ...categoryOptions(type === "all" ? categories : categories.filter((c) => c.type?.toLowerCase() === type)),
    ], [categories, type]);

    const changeType = (value) => {
        setType(value);
        const selected = categories.find((c) => String(c.id) === String(categoryId));
        if (value !== "all" && selected && selected.type?.toLowerCase() !== value) setCategoryId("");
    };

    const runSearch = async (query, page) => {
        setLoading(true);
        try {
            const response = await axiosConfig.post(API_ENDPOINTS.APPLY_FILTER, { ...query, page, size: PAGE_SIZE });
            const data = response.data || {};
            setTransactions(data.items || []);
            setPageInfo({
                page: data.page ?? page,
                totalItems: data.totalItems ?? 0,
                totalPages: data.totalPages ?? 0,
                totalAmount: data.totalAmount ?? 0,
            });
            setResultType(query.type);
            setLastQuery(query);
            setHasSearched(true);
        } catch (error) {
            console.error("Failed to fetch transactions", error);
            toast.error(getErrorMessage(error, "No se han podido buscar los movimientos. Inténtalo de nuevo"));
        } finally {
            setLoading(false);
        }
    }

    const handleSearch = (e) => {
        e.preventDefault();

        // Shown next to the form (audit: inline errors instead of toasts)
        if (startDate && endDate && startDate > endDate) {
            setFormError("La fecha de inicio debe ser anterior a la de fin");
            return;
        }
        if (minAmount !== "" && maxAmount !== "" && Number(minAmount) > Number(maxAmount)) {
            setFormError("El importe mínimo no puede ser mayor que el máximo");
            return;
        }
        setFormError(null);

        runSearch({
            type,
            categoryId: categoryId ? Number(categoryId) : null,
            minAmount: minAmount !== "" ? Number(minAmount) : null,
            maxAmount: maxAmount !== "" ? Number(maxAmount) : null,
            startDate: startDate || null,
            endDate: endDate || null,
            keyword,
            sortField,
            sortOrder
        }, 0);
    }

    const goToPage = (page) => {
        if (!lastQuery || page < 0 || page >= pageInfo.totalPages) return;
        runSearch(lastQuery, page);
        document.getElementById("search-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    const firstShown = pageInfo.totalItems === 0 ? 0 : pageInfo.page * PAGE_SIZE + 1;
    const lastShown = Math.min((pageInfo.page + 1) * PAGE_SIZE, pageInfo.totalItems);
    const pagerButton = "flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";

    return(
        <Dashboard activeMenu="Filters">
            <div className="my-5 mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Buscar movimientos
                    </h1>
                </div>

                <div className="p-4 mb-4 bg-white rounded-2xl border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-medium text-gray-900">
                            Filtros
                        </h2>
                    </div>

                    <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="type" className="block text-[13px] font-medium text-gray-700 mb-1">
                                Tipo
                            </label>
                            <select value={type} id="type" className="w-full bg-transparent border border-gray-300 rounded-lg py-2 px-3 text-gray-800 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-200" onChange={e => changeType(e.target.value)}>
                                <option value="all">Todos</option>
                                <option value="income">Ingresos</option>
                                <option value="expense">Gastos</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="categoryId" className="block text-[13px] font-medium text-gray-700 mb-1">
                                Categoría
                            </label>
                            <select value={categoryId} id="categoryId" className="w-full bg-transparent border border-gray-300 rounded-lg py-2 px-3 text-gray-800 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-200" onChange={e => setCategoryId(e.target.value)}>
                                {categoryChoices.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="minAmount" className="block text-[13px] font-medium text-gray-700 mb-1">
                                Importe mínimo (€)
                            </label>
                            <input value={minAmount} id="minAmount" type="number" min="0" step="0.01" inputMode="decimal" placeholder="0" className="w-full bg-transparent border border-gray-300 rounded-lg py-2 px-3 text-gray-800 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-200" onChange={e => setMinAmount(e.target.value)} aria-describedby={formError ? "filter-error" : undefined}/>
                        </div>
                        <div>
                            <label htmlFor="maxAmount" className="block text-[13px] font-medium text-gray-700 mb-1">
                                Importe máximo (€)
                            </label>
                            <input value={maxAmount} id="maxAmount" type="number" min="0" step="0.01" inputMode="decimal" placeholder="Sin límite" className="w-full bg-transparent border border-gray-300 rounded-lg py-2 px-3 text-gray-800 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-200" onChange={e => setMaxAmount(e.target.value)} aria-describedby={formError ? "filter-error" : undefined}/>
                        </div>

                        <div>
                            <label htmlFor="startDate" className="block text-[13px] font-medium text-gray-700 mb-1">
                                Desde
                            </label>
                            <input value={startDate} id="startDate" type="date" className="w-full bg-transparent border border-gray-300 rounded-lg py-2 px-3 text-gray-800 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-200" onChange={e => setStartDate(e.target.value)}/>
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-[13px] font-medium text-gray-700 mb-1">
                                Hasta
                            </label>
                            <input value={endDate} id="endDate" type="date" className="w-full bg-transparent border border-gray-300 rounded-lg py-2 px-3 text-gray-800 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-200" onChange={e => setEndDate(e.target.value)}/>
                        </div>
                        <div>
                            <label htmlFor="sortField" className="block text-[13px] font-medium text-gray-700 mb-1">
                                Ordenar por
                            </label>
                            <select value={sortField} id="sortField" className="w-full bg-transparent border border-gray-300 rounded-lg py-2 px-3 text-gray-800 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-200" onChange={e => setSortField(e.target.value)}>
                                <option value="date">Fecha</option>
                                <option value="amount">Importe</option>
                                <option value="name">Concepto</option>
                                <option value="category">Categoría</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="sortOrder" className="block text-[13px] font-medium text-gray-700 mb-1">
                                Orden
                            </label>
                            <select value={sortOrder} id="sortOrder" className="w-full bg-transparent border border-gray-300 rounded-lg py-2 px-3 text-gray-800 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-200" onChange={e => setSortOrder(e.target.value)}>
                                <option value="asc">Ascendente</option>
                                <option value="desc">Descendente</option>
                            </select>
                        </div>

                        <div className="sm:col-span-1 md:col-span-1 flex items-end">
                            <div className="w-full">
                                <label htmlFor="keyword" className="block text-[13px] font-medium text-gray-700 mb-1">
                                    Texto
                                </label>
                                <input value={keyword} id="keyword" type="text" placeholder="Buscar..." className="w-full bg-transparent border border-gray-300 rounded-lg py-2 px-3 text-gray-800 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-200" onChange={e => setKeyword(e.target.value)}/>
                            </div>
                            <button type="submit" aria-label="Buscar" disabled={loading} className="ml-2 p-2.5 bg-violet-700 hover:bg-violet-800 text-white rounded-lg flex items-center justify-center cursor-pointer disabled:opacity-50">
                                <Search size={20}/>
                            </button>
                        </div>
                        {formError && (
                            <p id="filter-error" role="alert" className="sm:col-span-2 lg:col-span-3 text-sm text-red-800">
                                {formError}
                            </p>
                        )}
                    </form>
                </div>

                <div id="search-results" className="p-4 bg-white rounded-2xl border border-gray-200 scroll-mt-24">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h2 className="text-lg font-medium text-gray-900">
                            Resultados
                        </h2>
                        {hasSearched && pageInfo.totalItems > 0 && (
                            <p className="text-sm text-gray-600" aria-live="polite">
                                {firstShown}–{lastShown} de {pageInfo.totalItems} · {resultType === "all" ? "Balance" : "Total"}: <span className="font-semibold text-gray-800">{formatCurrency(pageInfo.totalAmount)}</span>
                            </p>
                        )}
                    </div>
                    {transactions.length === 0 && !loading ? (
                        <p className="text-gray-500">
                            {hasSearched
                                ? "Ningún movimiento coincide con estos filtros"
                                : "Elige los filtros y pulsa buscar"}
                        </p>
                    ) : (
                        ""
                    )}
                    {loading ? (
                        <p className="text-gray-500">
                            Buscando...
                        </p>                    
                    ) : (
                        ""
                    )}
                    {!loading && transactions.map((transaction) => (
                        <TransactionInfoCard 
                            key={`${transaction.type || resultType}-${transaction.id}`}
                            title={transaction.name}
                            icon={transaction.icon}
                            date={formatDate(transaction.date)}
                            amount={transaction.amount}
                            type={resultType === "all" ? transaction.type : resultType}
                            hideDeleteBtn
                            recurring={transaction.recurringId != null}
                        />
                    ))}

                    {pageInfo.totalPages > 1 && (
                        <nav aria-label="Páginas de resultados" className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-100">
                            <button type="button" className={pagerButton} disabled={loading || pageInfo.page === 0} onClick={() => goToPage(pageInfo.page - 1)}>
                                <ChevronLeft size={16} /> Anterior
                            </button>
                            <span className="text-sm text-gray-600">
                                Página {pageInfo.page + 1} de {pageInfo.totalPages}
                            </span>
                            <button type="button" className={pagerButton} disabled={loading || pageInfo.page >= pageInfo.totalPages - 1} onClick={() => goToPage(pageInfo.page + 1)}>
                                Siguiente <ChevronRight size={16} />
                            </button>
                        </nav>
                    )}
                </div>
            </div>    
        </Dashboard>
    )
}

export default Filter;