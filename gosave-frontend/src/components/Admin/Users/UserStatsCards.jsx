import React from "react";

const UserStatsCards = ({ stats }) => {
  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getGrowthColor = (rate) => {
    if (rate > 10) return "text-green-400";
    if (rate > 5) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Users */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-300">Total Users</p>
            <p className="text-3xl font-bold text-white">
              {formatNumber(stats.overview.totalUsers)}
            </p>
          </div>
          <div className="p-3 bg-blue-500/20 rounded-full">
            <svg
              className="w-6 h-6 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
              />
            </svg>
          </div>
        </div>

        <div className="mt-4 flex items-center">
          <span
            className={`text-sm font-medium ${getGrowthColor(
              stats.growth.growthRate
            )}`}
          >
            {stats.growth.growthRate > 0 ? "+" : ""}
            {stats.growth.growthRate}%
          </span>
          <span className="text-sm text-gray-400 ml-2">vs last month</span>
        </div>
      </div>

      {/* Active Users */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-300">Active Users</p>
            <p className="text-3xl font-bold text-white">
              {formatNumber(stats.overview.activeUsers)}
            </p>
          </div>
          <div className="p-3 bg-green-500/20 rounded-full">
            <svg
              className="w-6 h-6 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        <div className="mt-4">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  (stats.overview.activeUsers / stats.overview.totalUsers) * 100
                }%`,
              }}
            ></div>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            {(
              (stats.overview.activeUsers / stats.overview.totalUsers) *
              100
            ).toFixed(1)}
            % of total users
          </p>
        </div>
      </div>

      {/* Premium Users */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-300">Premium Users</p>
            <p className="text-3xl font-bold text-white">
              {formatNumber(stats.overview.premiumUsers)}
            </p>
          </div>
          <div className="p-3 bg-purple-500/20 rounded-full">
            <svg
              className="w-6 h-6 text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-400">
            {formatCurrency(stats.revenue.monthlyRevenue)} MRR
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {formatCurrency(stats.revenue.averageRevenuePerUser)} ARPU
          </p>
        </div>
      </div>

      {/* Recent Registrations */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-300">New This Month</p>
            <p className="text-3xl font-bold text-white">
              {formatNumber(stats.growth.recentRegistrations)}
            </p>
          </div>
          <div className="p-3 bg-yellow-500/20 rounded-full">
            <svg
              className="w-6 h-6 text-yellow-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center space-x-4 text-sm">
            <div>
              <p className="text-gray-400">This week</p>
              <p className="text-white font-medium">
                {Math.round(stats.growth.recentRegistrations / 4)}
              </p>
            </div>
            <div>
              <p className="text-gray-400">Yesterday</p>
              <p className="text-white font-medium">
                {Math.round(stats.growth.recentRegistrations / 30)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Role Distribution */}
      <div className="col-span-full bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
        <h4 className="text-lg font-semibold text-white mb-4">
          User Role Distribution
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {stats.roleDistribution.admin}
            </div>
            <div className="text-sm text-gray-400">Admins</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {stats.roleDistribution.partner}
            </div>
            <div className="text-sm text-gray-400">Partners</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-400">
              {stats.roleDistribution.member}
            </div>
            <div className="text-sm text-gray-400">Members</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-400">
              {stats.roleDistribution.viewer}
            </div>
            <div className="text-sm text-gray-400">Viewers</div>
          </div>
        </div>

        {/* Role Distribution Chart */}
        <div className="mt-6">
          <div className="flex h-3 rounded-full overflow-hidden bg-gray-700">
            <div
              className="bg-purple-500 transition-all duration-300"
              style={{
                width: `${
                  (stats.roleDistribution.admin / stats.overview.totalUsers) *
                  100
                }%`,
              }}
              title={`Admins: ${stats.roleDistribution.admin}`}
            ></div>
            <div
              className="bg-blue-500 transition-all duration-300"
              style={{
                width: `${
                  (stats.roleDistribution.partner / stats.overview.totalUsers) *
                  100
                }%`,
              }}
              title={`Partners: ${stats.roleDistribution.partner}`}
            ></div>
            <div
              className="bg-indigo-500 transition-all duration-300"
              style={{
                width: `${
                  (stats.roleDistribution.member / stats.overview.totalUsers) *
                  100
                }%`,
              }}
              title={`Members: ${stats.roleDistribution.member}`}
            ></div>
            <div
              className="bg-gray-500 transition-all duration-300"
              style={{
                width: `${
                  (stats.roleDistribution.viewer / stats.overview.totalUsers) *
                  100
                }%`,
              }}
              title={`Viewers: ${stats.roleDistribution.viewer}`}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStatsCards;
