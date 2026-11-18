import React, { useEffect, useState } from "react";
import "../Assets/Css/Homepage.css";
import "../Assets/Css/Hub.css";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiMonitor, FiSearch, FiSmartphone } from "react-icons/fi";
import UserDropdown from "../Components/UserDropdown";
import SettingsMenu from "../Components/SettingsMenu";
import { isAuthenticatedUser } from "../services/auth";
import { toast } from "react-toastify";
import BrandLogo from "../Components/BrandLogo";

import { signOut } from "../services/session";

function SelectVideoType() {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("Username");
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    const userName = localStorage.getItem("userName");
    if (userName != null) {
      setUsername(userName);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticatedUser()) {
      window.location.href = "/";
    }
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    const keyword = searchKeyword.trim();
    if (!keyword) {
      toast.info("Please enter any search keyword");
      return;
    }
    setIsLoading(true);
    // Encoded so keywords containing "/" or "?" can't break the route.
    window.location.href = `/search-result/${encodeURIComponent(keyword)}`;
  };

  const handleLogout = () => {
    signOut();
  };

  return (
    <div className="hub">
      <div className="hub-topbar">
        <span className="hub-logo">
          <BrandLogo surface="dark" />
        </span>
        <div className="hub-user">
          <SettingsMenu />
          <UserDropdown username={username} onLogout={handleLogout} />
        </div>
      </div>

      <main className="hub-main">
        <section className="hub-content">
          <span className="hub-eyebrow">Tutorial Video Gallery</span>
          <h1 className="hub-title">
            Welcome to <span className="hub-title-accent">InfraByte</span>{" "}
            Videos
          </h1>
          <p className="hub-subtitle">
            Your tutorials are ready to play. Search the library, or choose a
            platform to start watching.
          </p>

          <form className="hub-search" noValidate onSubmit={handleSubmit}>
            <FiSearch className="hub-search-icon" aria-hidden="true" />
            <input
              type="text"
              className="hub-search-input"
              placeholder="Search InfraByte videos"
              aria-label="Search videos"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            <button type="submit" className="hub-search-btn">
              Search
            </button>
            {isLoading && <span className="loading-spinner" />}
          </form>

          <div className="hub-choices">
            <button
              type="button"
              className="hub-choice"
              onClick={() => navigate("/videos/web")}
            >
              <span className="hub-choice-icon" aria-hidden="true">
                <FiMonitor size={22} />
              </span>
              <span className="hub-choice-text">
                <span className="hub-choice-title">Web</span>
                <span className="hub-choice-sub">
                  Tutorials for the InfraByte web app
                </span>
              </span>
              <FiArrowRight className="hub-choice-arrow" aria-hidden="true" />
            </button>

            <button
              type="button"
              className="hub-choice"
              onClick={() => navigate("/videos/mobile")}
            >
              <span className="hub-choice-icon" aria-hidden="true">
                <FiSmartphone size={22} />
              </span>
              <span className="hub-choice-text">
                <span className="hub-choice-title">Mobile</span>
                <span className="hub-choice-sub">
                  Tutorials for the InfraByte mobile app
                </span>
              </span>
              <FiArrowRight className="hub-choice-arrow" aria-hidden="true" />
            </button>
          </div>
        </section>
      </main>

      <div className={isLoading ? "loading-bar" : "d-none"}></div>
    </div>
  );
}

export default SelectVideoType;
