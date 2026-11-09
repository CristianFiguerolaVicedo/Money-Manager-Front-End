import TransactionsPage from "../components/TransactionsPage";
import { TRANSACTION_TYPES } from "../config/transactionTypes";

const Expense = () => <TransactionsPage config={TRANSACTION_TYPES.expense} />;

export default Expense;
