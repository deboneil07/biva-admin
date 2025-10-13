import { useLocation } from "react-router-dom";


const routeMap: Record<string, string> = {
  dashboard: "Dashboard",
  team: "Team",
  upload: "Upload",
  analytics: "Analytics",
  projects: "Projects",
  gallery: "Gallery",
  manage: "Manage",
  settings: "Settings",
  overview: "Overview",
  reports: "Reports",
  insights: "Insights",
};

export function DynamicBreadcrumb() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter(Boolean);

  if (pathnames.length === 0) {
    return <div className="text-lg font-medium text-gray-700">Home</div>;
  }

  const displayNames = pathnames.map(
    (p) => routeMap[p] || p.charAt(0).toUpperCase() + p.slice(1)
  );

  return (
    <div className="text-gray-700 font-medium text-lg">
      {displayNames.join(" / ")}
    </div>
  );
}
