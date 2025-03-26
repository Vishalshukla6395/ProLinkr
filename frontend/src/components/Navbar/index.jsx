import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { reset } from "@/config/redux/reducer/authReducer";
import styles from "./navbar.module.css";

function Navbar() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { profileFetched } = useSelector((state) => state.auth);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
    dispatch(reset());
  };

  return (
    <header className={styles.navbarContainer}>
      <nav className={styles.navbar}>
        <div className={styles.brand} onClick={() => router.push("/")}>
          ProLinkr
        </div>
        <div className={styles.navItems}>
          {profileFetched ? (
            <>
              <span
                className={styles.navItem}
                onClick={() => router.push("/profile")}
              >
                Profile
              </span>
              <span className={styles.navItem} onClick={handleLogout}>
                Logout
              </span>
            </>
          ) : (
            <>
              <span
                className={styles.navItem}
                onClick={() => router.push("/login")}
              >
                Login
              </span>
              <button
                className={styles.signUpButton}
                onClick={() => router.push("/login")}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
