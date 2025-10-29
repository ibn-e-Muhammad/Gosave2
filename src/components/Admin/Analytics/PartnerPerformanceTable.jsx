import { useState } from "react";
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Eye,
  Search,
  Store,
} from "lucide-react";
import GlassCard from "../../UI/GlassCard";

const PartnerPerformanceTable = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("redemptions"); // redemptions, savings, deals

  if (!data || !data.length) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 rounded-lg bg-yellow-500/20">
            <Trophy className="w-5 h-5 text-yellow-300" />
          </div>
          <h3 className="text-white text-lg font-semibold">
            Partner Performance
          </h3>
        </div>
        <div className="text-center text-white/60 py-8">
          <Store className="w-12 h-12 mx-auto mb-3 text-white/30" />
          <p>No partner performance data available</p>
        </div>
      </GlassCard>
    );
  }

  // Filter and sort data
  const filteredData = data.filter(
    (partner) =>
      partner.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedData = [...filteredData].sort((a, b) => {
    switch (sortBy) {
      case "redemptions":
        return (b.total_redemptions || 0) - (a.total_redemptions || 0);
      case "savings":
        return (b.total_savings || 0) - (a.total_savings || 0);
      case "deals":
        return (b.active_deals || 0) - (a.active_deals || 0);
      default:
        return 0;
    }
  });

  const getRankIcon = (index) => {
    if (index === 0) return <Trophy className="w-4 h-4 text-yellow-300" />;
    if (index === 1) return <Trophy className="w-4 h-4 text-gray-300" />;
    if (index === 2) return <Trophy className="w-4 h-4 text-orange-300" />;
    return (
      <span className="w-4 h-4 flex items-center justify-center text-white/60 text-xs font-bold">
        {index + 1}
      </span>
    );
  };

  const getTrendIcon = (redemptions) => {
    if (redemptions > 10)
      return <TrendingUp className="w-3 h-3 text-green-300" />;
    if (redemptions < 5)
      return <TrendingDown className="w-3 h-3 text-red-300" />;
    return <div className="w-3 h-3 rounded-full bg-yellow-300"></div>;
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-yellow-500/20">
            <Trophy className="w-5 h-5 text-yellow-300" />
          </div>
          <div>
            <h3 className="text-white text-lg font-semibold">
              Partner Performance
            </h3>
            <p className="text-white/60 text-sm">
              Top performing partners this month
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search partners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/10 text-white text-sm rounded-lg pl-9 pr-3 py-2 border border-white/20 focus:outline-none focus:border-yellow-400 w-48"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white/10 text-white text-sm rounded-lg px-3 py-2 border border-white/20 focus:outline-none focus:border-yellow-400"
          >
            <option value="redemptions">Sort by Redemptions</option>
            <option value="savings">Sort by Savings</option>
            <option value="deals">Sort by Active Deals</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-2 text-white/70 text-sm font-medium">
                Rank
              </th>
              <th className="text-left py-3 px-2 text-white/70 text-sm font-medium">
                Partner
              </th>
              <th className="text-left py-3 px-2 text-white/70 text-sm font-medium">
                Category
              </th>
              <th className="text-right py-3 px-2 text-white/70 text-sm font-medium">
                Redemptions
              </th>
              <th className="text-right py-3 px-2 text-white/70 text-sm font-medium">
                Total Savings
              </th>
              <th className="text-right py-3 px-2 text-white/70 text-sm font-medium">
                Active Deals
              </th>
              <th className="text-center py-3 px-2 text-white/70 text-sm font-medium">
                Trend
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((partner, index) => (
              <tr
                key={partner.id}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="py-3 px-2">{getRankIcon(index)}</td>
                <td className="py-3 px-2">
                  <div>
                    <div className="text-white font-medium text-sm">
                      {partner.business_name}
                    </div>
                    <div className="text-white/60 text-xs">
                      {partner.contact_email}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-white/10 text-white/80">
                    {partner.category || "General"}
                  </span>
                </td>
                <td className="py-3 px-2 text-right">
                  <div className="text-white font-semibold">
                    {(partner.total_redemptions || 0).toLocaleString()}
                  </div>
                  <div className="text-white/60 text-xs">redemptions</div>
                </td>
                <td className="py-3 px-2 text-right">
                  <div className="text-green-300 font-semibold">
                    PKR {(partner.total_savings || 0).toFixed(0)}
                  </div>
                  <div className="text-white/60 text-xs">saved by users</div>
                </td>
                <td className="py-3 px-2 text-right">
                  <div className="text-white font-semibold">
                    {partner.active_deals || 0}
                  </div>
                  <div className="text-white/60 text-xs">deals</div>
                </td>
                <td className="py-3 px-2 text-center">
                  {getTrendIcon(partner.total_redemptions || 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sortedData.length === 0 && (
          <div className="text-center py-8 text-white/60">
            <Search className="w-8 h-8 mx-auto mb-2 text-white/30" />
            <p>No partners found matching your search</p>
          </div>
        )}
      </div>

      {/* Summary Footer */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-sm">
          <div className="text-white/70">
            Showing {sortedData.length} of {data.length} partners
          </div>
          <div className="flex items-center space-x-4 text-white/70">
            <span>
              Total Redemptions:{" "}
              {data
                .reduce((sum, p) => sum + (p.total_redemptions || 0), 0)
                .toLocaleString()}
            </span>
            <span>
              Total Savings: PKR{" "}
              {data
                .reduce((sum, p) => sum + (p.total_savings || 0), 0)
                .toFixed(0)}
            </span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default PartnerPerformanceTable;
