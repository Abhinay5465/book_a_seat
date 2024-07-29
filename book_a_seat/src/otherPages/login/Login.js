import React, { useRef, useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import AuthContext from '../../context/AuthProvider';
import axios from '../../api/axios';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const LOGIN_URL = SERVER_URL + 'api/login';

const ElementStyle = styled.div`
  margin-top: 2rem;
  text-align: left;

  section {
    width: 500px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding: 1rem;
    border: 1px solid rgba(0, 0, 0, 0.4);
  }

  form {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    flex-grow: 1;
    padding-bottom: 1rem;

    label, button {
      margin-top: 0.6rem;
    }
  }

  .wrapper_gif {
    margin-top: 12rem;
    border: 1px solid rgba(0, 0, 0, 0.4);
  }
`;

const NavbarStyle = styled.div`
  .navbar-custom {
    width: 1350px;
    margin: 0 auto;
  }

  .navbar-nav-left {
    margin-left: auto;
  }
`;

function Navbar() {
  return (
    <NavbarStyle>
      <nav className="navbar navbar-expand-lg navbar-light bg-light navbar-custom">
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
              {/* <li className="nav-item">
                <a className="nav-link" href="/login">
                  Login
                </a>
              </li> */}
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

  const [user, setUser] = useState('user1');
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
    <Navbar />
    <Login />
  </>
);

export default App;
