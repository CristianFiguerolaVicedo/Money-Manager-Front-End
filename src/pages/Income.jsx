import TransactionsPage from "../components/TransactionsPage";
import { TRANSACTION_TYPES } from "../config/transactionTypes";

const Income = () => <TransactionsPage config={TRANSACTION_TYPES.income} />;

export default Income;
