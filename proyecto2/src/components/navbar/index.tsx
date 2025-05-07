interface NavbarProps {
  displayText: string;
}

const Navbar = ({ displayText }: NavbarProps) => {
  const handleLogout = () => {
    localStorage.removeItem("loginInfo");
    window.location.href = "/";
  };

  return (
    <div className="navbarUser">
      <div>{displayText}</div>
      <button className="btnRed" onClick={handleLogout}>
        Log out
      </button>
    </div>
  );
};

export default Navbar;
