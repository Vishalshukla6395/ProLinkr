import {
  acceptConnection,
  getMyConnectionRequests,
} from "@/config/redux/action/authAction";
import DashboardLayout from "@/layout/dashboardLayout";
import UserLayout from "@/layout/userLayout";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Styles from "./my_connections.module.css";
import { useRouter } from "next/router";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const getProfileImage = (profilePicture) =>
  profilePicture && profilePicture.url ? profilePicture.url : "";

function MyConnections() {
  const dispatch = useDispatch();
  const { connectionRequest } = useSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    dispatch(getMyConnectionRequests({ token: localStorage.getItem("token") }));
  }, [dispatch]);

  const pendingRequests =
    connectionRequest?.filter((item) => item.status_accepted === null) || [];

  const acceptedConnections =
    connectionRequest?.filter((item) => item.status_accepted !== null) || [];

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={Styles.container}>
          <h1 className={Styles.heading}>Connections</h1>

          {pendingRequests.length > 0 && (
            <>
              <h2 className={Styles.sectionTitle}>Connection Requests</h2>
              <div className={Styles.userList}>
                {pendingRequests.map((user, index) => (
                  <div
                    key={user?._id || index}
                    className={Styles.userCard}
                    onClick={() =>
                      router.push(`/view_profile/${user.connectionId.username}`)
                    }
                  >
                    <div className={Styles.profilePicture}>
                      <img
                        src={getProfileImage(
                          user?.connectionId?.profilePicture
                        )}
                        alt={user?.connectionId?.name || "User"}
                      />
                    </div>
                    <div className={Styles.userInfo}>
                      <h3>{user?.connectionId?.name || "Unknown User"}</h3>
                      <p>{user?.connectionId?.username || "No username"}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(
                          acceptConnection({
                            connectionId: user._id,
                            token: localStorage.getItem("token"),
                            action: "accept",
                          })
                        );
                      }}
                      className={Styles.acceptBtn}
                    >
                      Accept
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {acceptedConnections.length > 0 && (
            <>
              <h2 className={Styles.sectionTitle}>My Network</h2>
              <div className={Styles.userList}>
                {acceptedConnections.map((user, index) => (
                  <div
                    key={user?._id || index}
                    className={Styles.userCard}
                    onClick={() =>
                      router.push(`/view_profile/${user.connectionId.username}`)
                    }
                  >
                    <div className={Styles.profilePicture}>
                      <img
                        src={getProfileImage(
                          user?.connectionId?.profilePicture
                        )}
                        alt={user?.connectionId?.name || "User"}
                      />
                    </div>
                    <div className={Styles.userInfo}>
                      <h3>{user?.connectionId?.name || "Unknown User"}</h3>
                      <p>{user?.connectionId?.username || "No username"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {pendingRequests.length === 0 && acceptedConnections.length === 0 && (
            <p>No connections or requests.</p>
          )}
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}

export default MyConnections;
