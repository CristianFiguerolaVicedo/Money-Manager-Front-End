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

    acc[dateKey].totalAmount += item.amount;
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
