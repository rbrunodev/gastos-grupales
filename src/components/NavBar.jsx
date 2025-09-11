import "./NavBar.css";

export function NavBar() {
    return (
        <header className="navbar">
            <div className="navbar-left" onClick={() => setLocation("/")}>
                <span className="navbar-title">Gastos Grupales</span>
            </div>
        </header>
    );
}
