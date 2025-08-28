import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

function NavBar() {
  return (
    <Navbar collapseOnSelect expand="lg" className="bg-body-secondary">
      <Container>
        <Navbar.Brand href="/portfolio">PortManager</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/portfolio">Portfolio</Nav.Link>
            <Nav.Link href="/holdings">Holdings</Nav.Link>
            <Nav.Link href="/performance">Performance</Nav.Link>
          </Nav>
          <Nav>
            <NavDropdown title="Account" id="collapsible-nav-dropdown">
              <NavDropdown.Item href="/login">
                Sign In
              </NavDropdown.Item>
              <NavDropdown.Item href="/signup">
                Register
              </NavDropdown.Item>
              <NavDropdown.Item href="#logout">
                Sign Out
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;