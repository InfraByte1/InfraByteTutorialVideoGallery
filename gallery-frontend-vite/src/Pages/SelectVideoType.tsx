import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import "../Assets/Css/Homepage.css";
import logo from "../Assets/images/nonon.png";
import UserDropdown from "../Components/UserDropdown";
import { useAuthContext } from "../context/AuthContext";
import { getUserDisplayName } from "../services/auth";

function SelectVideoType() {
  const navigate = useNavigate();
  const { isAuthenticated, user, importToken, logout } = useAuthContext();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");

  const username = getUserDisplayName(user);

  const openWebVideos = () => navigate("/videos/web");
  const openMobileVideos = () => navigate("/videos/mobile");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!searchKeyword) {
      toast.info("Please enter any search keyword");
      return;
    }
    setIsLoading(true);

    try {
      setIsLoading(false);
      window.location.href = `/search-result/${searchKeyword}`;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast.info(`Error fetching data: ${message}`);
      setIsLoading(false);
    }
  };

  // Lets an external site (e.g. tutorial.infrabyte.com.au/videos?token=...)
  // hand this page a ready-made access token, skipping the OIDC redirect
  // entirely. Combined into one effect with the auth guard below: importing
  // the token flips `isAuthenticated` via a state update, which this same
  // effect run can't see yet (state updates don't apply until the next
  // render) — so the guard has to be checked in the same pass, right after
  // the import attempt, not in a separate effect racing against it. Two
  // separate effects here previously meant a token-bearing visitor got
  // bounced straight back to "/" before the import ever took effect.
  useEffect(() => {
    if (token && importToken(token)) {
      window.history.replaceState({}, document.title, "/videos");
      return;
    }
    if (!isAuthenticated) {
      window.location.href = "/";
    }
  }, [token, importToken, isAuthenticated]);

  return (
    <div className="home-container ">
      <div className="home-page home-bg-container">
        <div className="overlay">
          <div className="inner-container ">
            <div className="">
              <h6 className="heading1 mb-2">
                Welcome to <span className="title-color">InfraByte</span> Videos
              </h6>
              <h1 className="heading2 mt-3 mb-5">
                <span>
                  <img src={logo} alt="logo" width="160" />
                </span>{" "}
                videos are ready to play .
              </h1>
              <Form className="d-flex justify-content-end w-100 mt-2 mb-2" noValidate onSubmit={handleSubmit}>
                <Form.Control
                  type="text"
                  placeholder="Search infrabyte videos . . . "
                  className="search-container"
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
                <Button type="submit" variant=" mx-2 button-container">
                  Search{" "}
                </Button>
                {isLoading && (
                  <span>
                    <div className="loading-spinner"></div>
                  </span>
                )}
              </Form>
              <h1 className="heading2 mt-3 mb-3">Watch video about InfraByte web or mobile.</h1>
              <button className="button-container  mx-0" onClick={openWebVideos}>
                <i className="fas fa-globe"></i> {"  "}
                Web
              </button>
              <button className="button-container  mx-3" onClick={openMobileVideos}>
                <i className="fa fa-mobile"></i> {"  "}
                Mobile
              </button>
            </div>
          </div>

          <p className="my-5 poweredby ">
            <UserDropdown username={username} onLogout={logout} />
          </p>
        </div>
      </div>
      <div className={isLoading ? "loading-bar" : "d-none"}></div>
    </div>
  );
}

export default SelectVideoType;
