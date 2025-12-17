import React, { useState } from "react";
import {
  Home,
  Navigation,
  Users,
  Map,
  Calendar,
  Award,
  User,
  Info,
  LogOut,
  MessageCircle,
  ChevronDown,
  LayoutDashboard,
  Briefcase,
  Globe,
  UserCheck,
  Utensils,
  Compass,
  LogIn,
  UserPlus,
  TrendingUp,
} from "lucide-react";

export default function Navbar({
  currentPage,
  setCurrentPage,
  isAuthenticated,
  user,
  onLogout,
}) {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Primary navigation items (always visible)
  const primaryNavItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "destinations", label: "Destinations", icon: Map },
    { id: "about", label: "About", icon: Info },
  ];

  // Items only for logged in users
  const privateNavItems = [
    { id: "community", label: "Community", icon: MessageCircle },
    { id: "my-trips", label: "My Trips", icon: Calendar },
    { id: "friends", label: "Friends", icon: Users },
    { id: "rewards", label: "Rewards", icon: Award },
    { id: "group-events", label: "Group Events", icon: Calendar },
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "agency", label: "Agency Portal", icon: Briefcase },
    { id: "map", label: "Interactive Map", icon: Globe },
    { id: "heatmap", label: "Activity Heatmap", icon: TrendingUp },
    { id: "local-guides", label: "Local Guides", icon: UserCheck },
    { id: "culture", label: "Culture & Food", icon: Utensils },
    { id: "trip-planner", label: "Trip Planner", icon: Compass },
    { id: "route-planner", label: "Route Estimator", icon: Navigation },
  ];

  // Items only for logged out users
  const publicNavItems = [
    { id: "login", label: "Login", icon: LogIn },
    { id: "register", label: "Register", icon: UserPlus },
  ];

  // Combine items based on auth state
  const secondaryNavItems = isAuthenticated ? privateNavItems : publicNavItems;

  const handleNavClick = (id) => {
    setCurrentPage(id);
    setShowMoreMenu(false);
  };

  const isSecondaryActive = secondaryNavItems.some(
    (item) => item.id === currentPage
  );

  return (
    <nav
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        borderBottom: "1px solid rgba(5, 150, 105, 0.1)",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "0 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "72px",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            minWidth: "200px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #059669, #0d9488)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(5, 150, 105, 0.3)",
            }}
          >
            <Map size={22} color="white" strokeWidth={2.5} />
          </div>
          <div>
            <h1
              style={{
                fontSize: "26px",
                fontWeight: "700",
                background: "linear-gradient(135deg, #059669, #0d9488)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                margin: 0,
                lineHeight: 1,
                letterSpacing: "-0.5px",
              }}
            >
              PothChola
            </h1>
            <span
              style={{
                fontSize: "11px",
                color: "#6b7280",
                fontWeight: "500",
                letterSpacing: "0.5px",
              }}
            >
              TRAVEL SMART
            </span>
          </div>
        </div>

        {/* Primary Navigation Links */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            flex: 1,
            justifyContent: "center",
          }}
        >
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                style={{
                  padding: "10px 20px",
                  borderRadius: "12px",
                  fontSize: "15px",
                  fontWeight: "600",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  backgroundColor: isActive ? "#059669" : "transparent",
                  color: isActive ? "#ffffff" : "#374151",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  transform: isActive ? "translateY(-2px)" : "translateY(0)",
                  boxShadow: isActive
                    ? "0 4px 12px rgba(5, 150, 105, 0.3)"
                    : "none",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "#f0fdf4";
                    e.currentTarget.style.color = "#059669";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#374151";
                    e.currentTarget.style.transform = "translateY(0)";
                  }
                }}
              >
                <Icon size={18} strokeWidth={2.5} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* More Dropdown */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              style={{
                padding: "10px 20px",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: "600",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: isSecondaryActive ? "#059669" : "transparent",
                color: isSecondaryActive ? "#ffffff" : "#374151",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                transform: isSecondaryActive
                  ? "translateY(-2px)"
                  : "translateY(0)",
                boxShadow: isSecondaryActive
                  ? "0 4px 12px rgba(5, 150, 105, 0.3)"
                  : "none",
              }}
              onMouseEnter={(e) => {
                if (!isSecondaryActive) {
                  e.currentTarget.style.backgroundColor = "#f0fdf4";
                  e.currentTarget.style.color = "#059669";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSecondaryActive) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#374151";
                  e.currentTarget.style.transform = "translateY(0)";
                }
              }}
            >
              <span>More</span>
              <ChevronDown
                size={16}
                style={{
                  transform: showMoreMenu ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.3s",
                }}
              />
            </button>

            {/* Dropdown Menu */}
            {showMoreMenu && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  backgroundColor: "white",
                  borderRadius: "16px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  padding: "8px",
                  minWidth: "220px",
                  border: "1px solid rgba(0,0,0,0.06)",
                  animation: "slideDown 0.2s ease-out",
                }}
              >
                {secondaryNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        borderRadius: "10px",
                        fontSize: "15px",
                        fontWeight: "500",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        backgroundColor: isActive ? "#f0fdf4" : "transparent",
                        color: isActive ? "#059669" : "#374151",
                        transition: "all 0.2s",
                        textAlign: "left",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f0fdf4";
                        e.currentTarget.style.color = "#059669";
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = "#374151";
                        }
                      }}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Section - Profile & Logout */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
            minWidth: "200px",
            justifyContent: "flex-end",
          }}
        >
          {isAuthenticated ? (
            <>
              {/* Profile Button */}
              <button
                onClick={() => handleNavClick("profile")}
                style={{
                  padding: "10px 18px",
                  borderRadius: "12px",
                  fontSize: "15px",
                  fontWeight: "600",
                  border:
                    currentPage === "profile"
                      ? "2px solid #059669"
                      : "2px solid #e5e7eb",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor:
                    currentPage === "profile" ? "#f0fdf4" : "white",
                  color: currentPage === "profile" ? "#059669" : "#374151",
                  transition: "all 0.3s",
                }}
              >
                <User size={18} strokeWidth={2.5} />
                <span>{user ? user.name.split(" ")[0] : "Profile"}</span>
              </button>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 18px",
                  fontSize: "15px",
                  fontWeight: "600",
                  color: "#dc2626",
                  border: "2px solid transparent",
                  background: "transparent",
                  cursor: "pointer",
                  borderRadius: "12px",
                  transition: "all 0.3s",
                }}
              >
                <LogOut size={18} strokeWidth={2.5} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => handleNavClick("login")}
              style={{
                padding: "10px 24px",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: "600",
                border: "none",
                cursor: "pointer",
                backgroundColor: "#059669",
                color: "white",
                boxShadow: "0 4px 12px rgba(5, 150, 105, 0.3)",
                transition: "all 0.3s",
              }}
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Add keyframe animation for dropdown */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </nav>
  );
}
