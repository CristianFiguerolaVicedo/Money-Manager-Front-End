import moment from "moment";

export const addThousandSeparator = (num) => {
  if (num == null || isNaN(num)) return "";

  return Number(num).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 20
  });
};

export const prepareIncomeLineChartData = (data = []) => {
  const groupedByDate = data.reduce((acc, item) => {
    const dateKey = item.date;

    if (!acc[dateKey]) {
      acc[dateKey] = {
        date: dateKey,
        totalAmount: 0,
        items: [],
      };
    }

    acc[dateKey].totalAmount += Number(item.amount) || 0;
    acc[dateKey].items.push(item);
    return acc;
  }, {});

  let chartData = Object.values(groupedByDate);

  chartData.sort((a, b) => new Date(a.date) - new Date(b.date));

  chartData = chartData.map((dataPoint) => ({
    ...dataPoint,
    month: moment(dataPoint.date).format('Do MMM'),
  }));

  return chartData;
}

// Today's date as YYYY-MM-DD in the user's local timezone.
// (new Date().toISOString() is UTC, which is the wrong day around midnight in Spain.)
export const getTodayLocalDate = () => moment().format("YYYY-MM-DD");

// Best human-readable message from an axios error
export const getErrorMessage = (error, fallback = "Something went wrong. Please try again") =>
  error?.response?.data?.message || fallback;
