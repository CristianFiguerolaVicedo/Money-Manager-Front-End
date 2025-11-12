//export const BASE_URL = "https://money-manager-t0yw.onrender.com/api/v1.0";
export const BASE_URL = "http://localhost:8080/api/v1.0";
const CLOUDINARY_CLOUD_NAME = "drsuueqhd";

export const API_ENDPOINTS = {
    LOGIN: "/login",
    REGISTER: "/register",
    GET_USER_INFO: "/profile",
    GET_ALL_CATEGORIES: "/categories",
    ADD_CATEGORY: "/categories",
    UPDATE_CATEGORY: (categoryId) => `/categories/${categoryId}`,
    GET_ALL_INCOMES: "/incomes",
    CATEGORY_BY_TYPE: (type) => `/categories/${type}`,
    ADD_INCOME: "/incomes",
    DELETE_INCOME: (incomeId) => `/incomes/${incomeId}`,
    DOWNLOAD_INCOME_DETAILS: "/excel/download/income",
    EMAIL_INCOME_DETAILS: "/email/income-excel",
    GET_ALL_EXPENSES: "/expenses",
    ADD_EXPENSE: "/expenses",
    DELETE_EXPENSE: (expenseId) => `/expenses/${expenseId}`,
    DOWNLOAD_EXPENSE_DETAILS: "excel/download/expense",
    EMAIL_EXPENSE_DETAILS: "/email/expense-excel",
    APPLY_FILTER: "/filter",
    FETCH_DASHBOARD_DATA: "/dashboard",
    UPLOAD_IMAGE: `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`
}