import { API_ENDPOINTS } from "../util/apiEndpoints";

// Everything that differs between the income and the expense pages
export const TRANSACTION_TYPES = {
  income: {
    type: "income",
    singular: "Income",
    activeMenu: "Income",
    listTitle: "Income Sources",
    nameLabel: "Income Source",
    namePlaceholder: "e.g., Salary, Bonus, Freelance",
    overviewTitle: "Income Overview",
    overviewSubtitle: "Track your earnings over time and analyse your income trends",
    endpoints: {
      list: API_ENDPOINTS.GET_ALL_INCOMES,
      add: API_ENDPOINTS.ADD_INCOME,
      update: API_ENDPOINTS.UPDATE_INCOME,
      remove: API_ENDPOINTS.DELETE_INCOME,
      download: API_ENDPOINTS.DOWNLOAD_INCOME_DETAILS,
      email: API_ENDPOINTS.EMAIL_INCOME_DETAILS,
    },
  },
  expense: {
    type: "expense",
    singular: "Expense",
    activeMenu: "Expense",
    listTitle: "All Expenses",
    nameLabel: "Expense Source",
    namePlaceholder: "e.g., Bills, Transport, Utilities",
    overviewTitle: "Expense Overview",
    overviewSubtitle: "Track your spending trends over time and gain insights into where your money goes.",
    endpoints: {
      list: API_ENDPOINTS.GET_ALL_EXPENSES,
      add: API_ENDPOINTS.ADD_EXPENSE,
      update: API_ENDPOINTS.UPDATE_EXPENSE,
      remove: API_ENDPOINTS.DELETE_EXPENSE,
      download: API_ENDPOINTS.DOWNLOAD_EXPENSE_DETAILS,
      email: API_ENDPOINTS.EMAIL_EXPENSE_DETAILS,
    },
  },
};
