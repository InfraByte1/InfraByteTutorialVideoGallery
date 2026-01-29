import logo from "../assets/images/nonon.png";
import "../assets/css/HomePage.css";

const Home = () => {
  const handleGetStarted = () => {
    console.log("Get Started clicked");
    // later: navigate, login, open modal, etc.
  };

  return (
    <div className="home-container">
      <div className="home-page">
        <div className="overlay">
          <div className="inner-container">
            {/* <h6 className="heading1">
              Welcome to <span className="title-color">InfraByte</span> Videos
            </h6> */}

            <h1 className="heading2 ">
              <span>
                <img src={logo} alt="logo" width={125} />
              </span>{" "}
              videos are ready to play.
            </h1>
            <p className="home-description">
              Watch step-by-step video tutorials to learn how to use InfraByte’s
              mobile and web applications effectively.
            </p>
            <button className="button-container" onClick={handleGetStarted}>
              Get Started
            </button>
          </div>

          <p className="poweredby">
            <strong>
              Powered by{" "}
              <a
                href="https://infrabyte.com.au/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={logo} alt="logo" width={90} />
              </a>
            </strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
