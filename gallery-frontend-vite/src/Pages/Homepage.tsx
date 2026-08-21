import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../Assets/Css/Homepage.css";
import logo from "../Assets/images/nonon.png";
import { useAuthContext } from "../context/AuthContext";
import { removeAllCookies } from "../services/auth";

// The sample video already referenced elsewhere in the app as placeholder
// tutorial content (data/category.ts's BigBuckBunny.mp4 URL) turned out to
// be dead — that Google sample bucket now returns 403. This is MDN's own
// CC0 example media instead, confirmed reachable.
const DEMO_VIDEO_URL = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

function Homepage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthContext();

  const [isSigningIn, setIsSigningIn] = useState(false);
  const isShared = Boolean((location.state as { isShared?: boolean } | null)?.isShared);

  const startLogin = () => {
    setIsSigningIn(true);
    // Dev-only shortcut: land straight on /callback, which falls back to
    // VITE_DEV_ACCESS_TOKEN when there's no ?code= — skips the real
    // identity-server redirect entirely for local development.
    if (import.meta.env.VITE_APP_ENV === "development") {
      navigate("/callback");
      return;
    }
    login();
  };

  useEffect(() => {
    // Full-page logout redirects can't carry React Router state (see
    // auth.ts's logout()), so this is read from sessionStorage instead —
    // single-use, same pattern as the "shared" key in SearchPage.
    const justLoggedOut = sessionStorage.getItem("justLoggedOut") === "true";
    sessionStorage.removeItem("justLoggedOut");

    if (isShared) {
      // Came back here after a share-link view failed because the visitor
      // wasn't signed in — go straight to login instead of the landing page.
      startLogin();
    } else if (document.referrer === "") {
      // Direct visit (typed URL, bookmark) — show the landing page and let
      // them click "Get Started".
    } else if (!justLoggedOut) {
      // Arrived via a link from elsewhere, and not immediately after
      // logging out — assume they want back into the app, not the pitch page.
      removeAllCookies();
      startLogin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="home-container">
      <div className="home-page ">
        <div className="overlay">
          <div className="inner-container ">
            <div className="">
              <video className="hero-preview-video" src={DEMO_VIDEO_URL} autoPlay muted loop playsInline />
              <h6 className="heading1">
                Welcome to <span className="title-color">InfraByte</span> Tutorials
              </h6>
              <h1 className="heading2 mt-3 mb-5">
                <span>
                  <img src={logo} alt="logo" width="160" />
                </span>{" "}
                videos are ready to play .
              </h1>

              <button className="button-container  mx-0" onClick={startLogin}>
                Get Started
              </button>
            </div>
          </div>
          <p className="poweredby">
            <strong style={{ color: "orange" }}>
              Powered by <a href="https://infrabyte.com.au/">Infrabyte</a>
            </strong>
          </p>
        </div>
      </div>
      <div className={isSigningIn ? "loading-bar" : "d-none"}></div>
    </div>
  );
}

export default Homepage;
