import UserLayout from "@/layout/userLayout";
import { useDispatch, useSelector } from "react-redux";
import styles from "./login.module.css";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { loginUser, registerUser } from "@/config/redux/action/authAction";
import { emptyMessage } from "@/config/redux/reducer/authReducer";

function LoginComponent() {
  const authState = useSelector((state) => state.auth);

  const router = useRouter();

  const dispatch = useDispatch();

  const [userLoginMethod, setUserLoginMethod] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (authState.loggedIn) {
      router.push("/dashboard");
    }
  }, [authState.loggedIn]);

  useEffect(() => {
    dispatch(emptyMessage());
  }, [userLoginMethod]);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      router.push("/dashboard");
    }
  }, []);

  const handleRegister = (e) => {
    e.preventDefault();
    dispatch(registerUser(formData));
    setFormData({ name: "", username: "", email: "", password: "" });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const loginData = {
      email: formData.email,
      password: formData.password,
    };
    dispatch(loginUser(loginData));
    setFormData({ email: "", password: "" });
  };

  return (
    <UserLayout>
      <div className={styles.container}>
        <div className={styles.cardContainer}>
          <div className={styles.cardContainer_left}>
            <p className={styles.leftCard_heading}>
              {userLoginMethod ? "Sign In" : "Sign Up"}
            </p>
            <p
              style={{
                color: authState.isError ? "red" : "green",
                marginTop: "0.5rem",
                fontSize: "1rem",
              }}
            >
              {authState.message.message}
            </p>
            <form
              onSubmit={userLoginMethod ? handleLogin : handleRegister}
              className={styles.form}
            >
              {!userLoginMethod && (
                <div className={styles.row}>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    type="text"
                    className={styles.inputField}
                    placeholder="Full Name"
                    required
                  />
                  <input
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    type="text"
                    className={styles.inputField}
                    placeholder="Username"
                    required
                  />
                </div>
              )}

              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                type="email"
                className={styles.inputField}
                placeholder="Email"
                required
              />
              <input
                name="password"
                value={formData.password}
                onChange={handleChange}
                type="password"
                className={styles.inputField}
                placeholder="Password"
                required
              />
              <button type="submit" className={styles.signUpButton}>
                {userLoginMethod ? "Sign In" : "Sign Up"}
              </button>
            </form>
          </div>
          <div className={styles.cardContainer_right}>
            {userLoginMethod ? (
              <p>Don't Have an Account ?</p>
            ) : (
              <p>Already Have an Account ?</p>
            )}

            <button
              type="submit"
              onClick={() => {
                setUserLoginMethod(!userLoginMethod);
              }}
              className={styles.signUpButton2}
            >
              {userLoginMethod ? "Sign Up" : "Sign In"}
            </button>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}

export default LoginComponent;
