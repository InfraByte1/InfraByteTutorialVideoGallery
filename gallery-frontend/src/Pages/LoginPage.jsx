import React, { useState } from "react";
import { Form, Button, Container, Row, Col, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import logo from '../Assets/images/nonon.png'
import "../Assets/Css/Login.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [validated, setValidated] = useState(false);

  let navigate = useNavigate();

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }

    setValidated(true);
    if (validated) {
        localStorage.setItem('token', 'mockToken');
      navigate("/videos");
    }
  };

  return (
    <>
      <Container className="login-container">
        <Col className="justify-content-space-around d-flex flex-column ">
          <img src={logo} alt="bar" width="120" hight="120" />
          <Col className="mt-3">
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
              <h2 className="heading3">Please sign-in to continue!</h2>
              <Form.Group controlId="formBasicEmail" className="mt-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="Username"
                  placeholder="Username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please provide a valid email.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group controlId="formBasicPassword" className="mt-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please provide a password.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group controlId="formBasicCheckbox" className="mt-3">
                <Form.Check
                  type="checkbox"
                  label="Remember My Login"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
              </Form.Group>

              <Button
                variant="primary"
                className="button-container mt-3 w-100"
                type="submit"
                block 
              >
                Login
              </Button>
            </Form>
          </Col>
        </Col>
      </Container>
    </>
  );
};

export default LoginPage;
