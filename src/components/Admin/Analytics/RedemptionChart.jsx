import { useState } from "react";
import { BarChart3, TrendingUp, Calendar, Filter } from "lucide-react";
import GlassCard from "../../UI/GlassCard";

const RedemptionChart = ({ data }) => {
  const [viewType, setViewType] = useState("daily"); // daily, weekly, monthly

  if (!data || !data.length) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <BarChart3 className="w-5 h-5 text-purple-300" />
          </div>
          <h3 className="text-white text-lg font-semibold">
            Redemption Trends
          </h3>
        </div>
        <div className="text-center text-white/60 py-8">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 text-white/30" />
          <p>No redemption data available</p>
        </div>
      </GlassCard>
    );
  }

  // Process data for different view types
  const processedData = data.slice(-30); // Show last 30 data points
  const maxValue = Math.max(
    ...processedData.map((item) => item.total_redemptions)
  );
  const totalRedemptions = processedData.reduce(
    (sum, item) => sum + item.total_redemptions,
    0
  );
  const totalSavings = processedData.reduce(
    (sum, item) => sum + parseFloat(item.total_discount || 0),
    0
  );

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <BarChart3 className="w-5 h-5 text-purple-300" />
          </div>
          <div>
            <h3 className="text-white text-lg font-semibold">
              Redemption Trends
            </h3>
            <p className="text-white/60 text-sm">Last 30 days</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={viewType}
            onChange={(e) => setViewType(e.target.value)}
            className="bg-white/10 text-white text-sm rounded-lg px-3 py-1 border border-white/20 focus:outline-none focus:border-purple-400"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-white/60 text-xs mb-1">Total Redemptions</div>
          <div className="text-white font-semibold">
            {totalRedemptions.toLocaleString()}
          </div>
        </div>
        <div className="text-center">
          <div className="text-white/60 text-xs mb-1">Total Savings</div>
          <div className="text-green-300 font-semibold">
            PKR {totalSavings.toFixed(0)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-white/60 text-xs mb-1">Avg per Day</div>
          <div className="text-white font-semibold">
            {(totalRedemptions / 30).toFixed(1)}
          </div>
        </div>
      </div>

      {/* Simple Bar Chart */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-white/60 mb-2">
          <span>Date</span>
          <span>Redemptions</span>
        </div>

        <div className="max-h-60 overflow-y-auto space-y-1">
          {processedData.map((item, index) => {
            const percentage =
              maxValue > 0 ? (item.total_redemptions / maxValue) * 100 : 0;
            const date = new Date(item.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });

            return (
              <div key={index} className="flex items-center space-x-3 py-1">
                <div className="text-xs text-white/70 w-16 flex-shrink-0">
                  {date}
                </div>

                <div className="flex-1 flex items-center">
                  <div className="w-full bg-white/10 rounded-full h-2 relative">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="ml-3 text-xs text-white font-medium w-8 text-right">
                    {item.total_redemptions}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trend Indicator */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-center text-sm">
          <TrendingUp className="w-4 h-4 text-green-300 mr-2" />
          <span className="text-white/70">
            {processedData.length > 1 &&
            processedData[processedData.length - 1].total_redemptions >
              processedData[processedData.length - 2].total_redemptions
              ? "Trending up"
              : "Steady activity"}
          </span>
        </div>
      </div>
    </GlassCard>
  );
};

export default RedemptionChart;
