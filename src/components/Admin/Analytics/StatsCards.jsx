import {
  Users,
  Store,
  Package,
  Activity,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import GlassCard from "../../UI/GlassCard";

const StatsCards = ({ data }) => {
  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <GlassCard key={i} className="p-6 animate-pulse">
            <div className="h-6 bg-white/20 rounded mb-2"></div>
            <div className="h-8 bg-white/20 rounded mb-1"></div>
            <div className="h-4 bg-white/20 rounded w-2/3"></div>
          </GlassCard>
        ))}
      </div>
    );
  }

  const statsConfig = [
    {
      title: "Total Partners",
      value: data.partners.total,
      subtitle: `${data.partners.approved} approved`,
      icon: Store,
      color: "text-blue-300",
      bgColor: "bg-blue-500/20",
      change:
        data.partners.pending > 0
          ? `${data.partners.pending} pending`
          : "All processed",
      changeColor:
        data.partners.pending > 0 ? "text-yellow-300" : "text-green-300",
    },
    {
      title: "Total Users",
      value: data.users.total,
      subtitle: `${data.users.members} members`,
      icon: Users,
      color: "text-green-300",
      bgColor: "bg-green-500/20",
      change: `${data.users.partners} partners`,
      changeColor: "text-blue-300",
    },
    {
      title: "Active Deals",
      value: data.deals.total,
      subtitle: `${data.deals.active} currently active`,
      icon: Package,
      color: "text-purple-300",
      bgColor: "bg-purple-500/20",
      change: data.deals.draft > 0 ? `${data.deals.draft} drafts` : "No drafts",
      changeColor: data.deals.draft > 0 ? "text-orange-300" : "text-gray-300",
    },
    {
      title: "Total Redemptions",
      value: data.activity.totalRedemptions,
      subtitle: `${data.activity.recentRedemptions} this month`,
      icon: Activity,
      color: "text-yellow-300",
      bgColor: "bg-yellow-500/20",
      change: `PKR ${data.activity.totalDiscountGiven.toFixed(0)} saved`,
      changeColor: "text-green-300",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsConfig.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <GlassCard
            key={index}
            className="p-6 hover:bg-white/10 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <h3 className="text-white/80 text-sm font-medium">
                    {stat.title}
                  </h3>
                </div>

                <div className="space-y-1">
                  <div className="text-2xl font-bold text-white">
                    {typeof stat.value === "number"
                      ? stat.value.toLocaleString()
                      : stat.value}
                  </div>
                  <div className="text-white/60 text-xs">{stat.subtitle}</div>
                  <div
                    className={`text-xs ${stat.changeColor} flex items-center`}
                  >
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {stat.change}
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
};

export default StatsCards;
