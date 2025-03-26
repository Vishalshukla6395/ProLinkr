import { getAllUsers } from "@/config/redux/action/authAction";
import DashboardLayout from "@/layout/dashboardLayout";
import UserLayout from "@/layout/userLayout";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Styles from "./discover.module.css";
import { useRouter } from "next/router";

function Discover() {
  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    if (!authState.all_profiles_fetched) {
      dispatch(getAllUsers());
    }
  }, [authState.all_profiles_fetched, dispatch]);

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={Styles.container}>
          <h1 className={Styles.title}>Connect with People</h1>
          <div className={Styles.allUserProfile}>
            {authState.all_profiles_fetched &&
              authState.all_users.map((user) => (
                <div
                  key={user._id}
                  className={Styles.userCard}
                  onClick={() =>
                    router.push(`/view_profile/${user.userId.username}`)
                  }
                >
                  <img
                    className={Styles.userCard_img}
                    src={user.userId.profilePicture.url}
                    alt={user.userId.name}
                  />
                  <div className={Styles.userInfo}>
                    <h1>{user.userId.name}</h1>
                    <p>@{user.userId.username}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}

export default Discover;
