import React, { useRef, useState, useEffect, useContext } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import AuthContext from '../../context/AuthProvider';
import axios from '../../api/axios';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const LOGIN_URL = SERVER_URL + 'api/login';

const GlobalStyle = createGlobalStyle`
  body, html, #root {
    height: 100%;
    margin: 0;
    padding: 0;
    background: linear-gradient(to bottom, #D1A272, white);
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: Arial, sans-serif;
  }
`;

const ElementStyle = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  position: relative;
  top: 50px;

  section {
    width: 500px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding: 1rem;
    border: 1px solid rgba(0, 0, 0, 0.4);
    background-color: rgba(255, 255, 255, 0.9); /* Slightly transparent background for the form */
    position: relative; /* Make sure the section is positioned relative for proper z-index stacking */
    border-radius: 10px;
    overflow: hidden; /* Ensures the image stays within the section */
  }

  .background-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url('https://api.daburinternational.com/wp-content/uploads/2024/01/fallback-image-square-800x800-1.jpg');
    background-size: cover;
    background-position: center;
    opacity: 0.4; /* Adjust opacity to make the image more or less transparent */
    z-index: 0.7; /* Ensure the image is behind the content */
  }

  form {
    position: relative; /* Ensure the form is above the background image */
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    flex-grow: 1;
    padding-bottom: 1rem;

    label, button {
      margin-top: 0.6rem;
    }
  }

  .errmsg {
    background-color: lightpink;
    color: red;
    padding: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .offscreen {
    display: none;
  }

  .line {
    display: inline-block;
    margin-top: 1rem;
  }
`;

const NavbarStyle = styled.div`
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  background: linear-gradient(bottom to top, #D1A272, white);
  display: flex;
  justify-content: center;

  .navbar-custom {
    width: 100%;
    max-width: 1350px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 1rem;
  }

  .navbar-nav-left {
    margin-left: auto;
  }
`;

function Navbar() {
  return (
    <NavbarStyle>
      <nav className="navbar navbar-expand-lg navbar-light navbar-custom">
        <div className="container-fluid">
          <a href="https://www.dabur.com/">
            <img
              src="https://img.etimg.com/thumb/width-1600,height-900,imgsize-34944,resizemode-75,msid-105238348/industry/cons-products/fmcg/140-year-old-dabur-family-hits-trouble-as-it-reinvents-its-business.jpg"
              alt="Dabur Logo"
              width="120"
              height="80"
              className="d-inline-block align-top"
            />
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav navbar-nav-left">
              <li className="nav-item">
                <a className="nav-link active" aria-current="page" href="/register">
                  Register
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </NavbarStyle>
  );
}

const Login = () => {
  const { setToken } = useContext(AuthContext);
  const userRef = useRef();
  const errRef = useRef();

  const [user, setUser] = useState('');
  const [pwd, setPwd] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    userRef.current.focus();
  }, []);

  useEffect(() => {
    setErrMsg('');
  }, [user, pwd]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        LOGIN_URL,
        JSON.stringify({ user, pwd }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );
      const accessToken = response?.data?.token;
      if (!accessToken) {
        setErrMsg('Login or password wrong...');
        setSuccess(false);
      } else {
        const role = response?.data?.role;
        setToken({ user, role, accessToken });
        setUser('');
        setPwd('');
        setSuccess(true);
      }
    } catch (err) {
      if (!err?.response) {
        setErrMsg('No Server Response');
      } else if (err.response?.status === 400) {
        setErrMsg('Missing Username or Password');
      } else if (err.response?.status === 401) {
        setErrMsg('Unauthorized');
      } else {
        setErrMsg('Login Failed');
      }
      errRef.current.focus();
    }
  };

  return (
    <ElementStyle>
      <section>
        <div className="background-image"></div>
        {errMsg && (
          <Alert
            key="danger"
            variant="danger"
            ref={errRef}
            className={errMsg ? 'errmsg' : 'offscreen'}
          >
            {errMsg}
          </Alert>
        )}
        <h1>Sign In</h1>
        <form onSubmit={handleSubmit} className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            ref={userRef}
            autoComplete="off"
            onChange={(e) => setUser(e.target.value)}
            value={user}
            required
            className="form-control"
          />

          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            onChange={(e) => setPwd(e.target.value)}
            value={pwd}
            required
            className="form-control"
          />
          <Button type="submit">Sign In</Button>
        </form>
        <p>
          Need an Account?
          <br />
          <span className="line">
            <a href="/register">Sign Up</a>
          </span>
        </p>
      </section>
    </ElementStyle>
  );
};

const App = () => (
  <>
    <GlobalStyle />
    <Navbar />
    <Login />
  </>
);

export default App;