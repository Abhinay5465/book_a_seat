import React, { useContext, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import AuthContext from '../context/AuthProvider';
import styled from 'styled-components';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Diagram from './Diagram';
import ReservationList from './ReservationList';
import MyBooking from './MyBooking';

const ElementStyle = styled.div`
  .navbar {
    background-color: #1d8b13;
  }

  .navbar-brand {
    color: #fff;
    &:hover {
      color: #ddd;
    }
  }

  .navbar-collapse {
    justify-content: flex-end;
  }

  .dropdown-toggle::after {
    display: none;
  }

  .dropdown-menu {
    background-color: #007bff;
    border: none;
  }

  .dropdown-item {
    color: #fff;
    &:hover {
      background-color: #0056b3;
    }
  }

  .tabs-container {
    margin-top: 20px;
  }

  .tab-content {
    padding: 20px;
    background-color: #f8f9fa;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }

  .wrapper-dashboard {
    padding: 20px;
  }

  h2 {
    margin-bottom: 20px;
  }

  .user-logo {
    display: flex;
    align-items: center;
    color: #fff;
    font-weight: bold;
    padding: 5px 10px;
    border-radius: 5px;
    background-color: #0056b3;
    &:hover {
      background-color: #004085;
      cursor: pointer;
    }
  }

  .user-logo .fa-user {
    margin-left: 10px;
  }
`;

function NavBar() {
  const { token, setToken } = useContext(AuthContext);
  const user = (
    <span className="user-logo">
      {token.user}
      <FontAwesomeIcon icon={faUser} transform="grow-5" />
    </span>
  );

  const logout = function () {
    console.log('logout');
    setToken(null);
  };

  const [keyBooking, setKeyBooking] = useState(0);
  const [keyDiagram, setKeyDiagram] = useState(token.role === 'admin' ? 1 : 0);
  const [selSeat, setSelSeat] = useState(null);

  function onSelectChange(tabElName) {
    if (tabElName === 'reservation') {
      setSelSeat(null);
      setKeyDiagram(keyDiagram + 1);
    } else {
      setKeyBooking(keyBooking + 1);
    }
  }

  function setSelSeatHandler(id) {
    setSelSeat(id);
  }

  return (
    <ElementStyle>
      <Navbar expand="lg" className="navbar">
        <Container fluid>
          <Navbar.Brand href="#home">Book a desk!</Navbar.Brand>
          <Navbar.Toggle aria-controls="navbarScroll" />
          <Navbar.Collapse id="navbarScroll">
            <Nav className="ms-auto">
              <NavDropdown title={user} id="navbarScrollingDropdown" align="end">
                <NavDropdown.Item href="#" onClick={logout}>
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container className="tabs-container">
        <Tabs
          onSelect={(tabElName) => onSelectChange(tabElName)}
          defaultActiveKey={token.role === 'user' ? 'booking' : 'reservation'}
          className="mb-3"
        >
          {token.role === 'user' && (
            <Tab eventKey="booking" title="My booking">
              <div className="tab-content">
                <MyBooking username={token.user} key={keyBooking} />
              </div>
            </Tab>
          )}
          <Tab eventKey="reservation" title="New Reservation">
            <div className="tab-content">
              <h2>{token.role === 'admin' ? 'ADMIN - Add seats and chairs' : ''}</h2>
              {keyDiagram > 0 && (
                <div className="wrapper-dashboard" key={'diagram_' + keyDiagram}>
                  <Diagram setSelSeat={setSelSeatHandler} />
                  <ReservationList selSeat={selSeat} />
                </div>
              )}
            </div>
          </Tab>
        </Tabs>
      </Container>
    </ElementStyle>
  );
}

export default NavBar;