import OverallStat from "../models/OverallStat.js";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const currentMonth = "November";
    const currentYear = 2021;
    const currentDay = "2021-11-15";

    // Fetch the latest 50 transactions, sorted by creation date
    const transactions = await Transaction.find()
      .limit(50)
      .sort({ createdAt: -1 });

    // Fetch overall statistics for the current year
    const overallStat = await OverallStat.find({ year: currentYear });

    // Ensure overallStat[0] exists before destructuring
    if (overallStat.length === 0) {
      return res.status(404).json({ message: "Overall statistics not found" });
    }

    const {
      totalCustomers,
      yearlyTotalSoldUnits,
      yearlySalesTotal,
      monthlyData,
      salesByCategory,
    } = overallStat[0];

    // Get statistics for the current month and day
    const thisMonthStats = monthlyData.find(
      ({ month }) => month === currentMonth
    );
    const todayStats = overallStat[0].dailyData.find(
      ({ date }) => date === currentDay
    );

    res.status(200).json({
      transactions,
      totalCustomers,
      yearlyTotalSoldUnits,
      yearlySalesTotal,
      monthlyData,
      salesByCategory,
      thisMonthStats,
      todayStats,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};
