import clientServer from "@/config/index";
import UserLayout from "@/layout/userLayout";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/layout/dashboardLayout";
import { allPosts } from "@/config/redux/action/postAction";
import { useSelector, useDispatch } from "react-redux";
import {
  getConnectionRequests,
  getMyConnectionRequests,
  sendConnectionRequest,
} from "@/config/redux/action/authAction";
import { useRouter } from "next/router";
import Styles from "./view_profile.module.css";

const getProfileImage = (profilePicture) => profilePicture?.url || "";

function ViewProfile({ initialUserProfile }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const authState = useSelector((state) => state.auth);
  const postReducer = useSelector((state) => state.post);

  const [userProfile, setUserProfile] = useState(initialUserProfile);
  const [userPosts, setUserPosts] = useState([]);
  const [isCurrentUserInConnection, setIsCurrentUserInConnection] =
    useState(false);
  const [isConnectionNull, setIsConnectionNull] = useState(true);

  const fetchProfileData = useCallback(async () => {
    try {
      const response = await clientServer.get("/user/get_profile_by_username", {
        params: { username: router.query.username },
      });
      setUserProfile(response.data.profile || {});
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  }, [router.query.username]);

  const fetchPostsAndConnections = useCallback(async () => {
    await dispatch(allPosts());
    await dispatch(
      getConnectionRequests({ token: localStorage.getItem("token") })
    );
    await dispatch(
      getMyConnectionRequests({ token: localStorage.getItem("token") })
    );
  }, [dispatch]);

  useEffect(() => {
    fetchProfileData();
    fetchPostsAndConnections();

    const interval = setInterval(() => {
      fetchProfileData();
      fetchPostsAndConnections();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchProfileData, fetchPostsAndConnections]);

  useEffect(() => {
    if (!authState.connections || !authState.connectionRequest) return;

    const isConnected = authState.connections.some(
      (c) => c.connectionId._id === userProfile?.userId?._id
    );

    const isRequestPending = authState.connectionRequest.some(
      (c) => c.userId._id === userProfile?.userId?._id
    );

    setIsCurrentUserInConnection(isConnected || isRequestPending);
    setIsConnectionNull(
      !(
        authState.connections.find(
          (c) => c.connectionId._id === userProfile?.userId?._id
        )?.status_accepted ||
        authState.connectionRequest.find(
          (c) => c.userId._id === userProfile?.userId?._id
        )?.status_accepted
      )
    );
  }, [authState.connections, authState.connectionRequest, userProfile]);

  useEffect(() => {
    const filtered = postReducer.posts.filter(
      (p) => p.userId.username === router.query.username
    );
    setUserPosts(filtered);
  }, [postReducer.posts, router.query.username]);

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={Styles.container}>
          <div className={Styles.bannerArea}>
            <div className={Styles.bannerOverlay} />
            <img
              src={getProfileImage(userProfile?.userId?.profilePicture)}
              alt="profile_pic"
              className={Styles.profilePic}
            />
          </div>

          <div className={Styles.profileContent}>
            <div className={Styles.userHeader}>
              <div className={Styles.nameSection}>
                <h2 className={Styles.userName}>{userProfile?.userId?.name}</h2>
                <p className={Styles.username}>
                  @{userProfile?.userId?.username}
                </p>
              </div>

              <div className={Styles.actionButtons}>
                {isCurrentUserInConnection ? (
                  <button className={Styles.connectedBtn}>
                    {isConnectionNull ? "Pending" : "Connected"}
                  </button>
                ) : (
                  <button
                    onClick={async () => {
                      await dispatch(
                        sendConnectionRequest({
                          token: localStorage.getItem("token"),
                          userId: userProfile?.userId?._id,
                        })
                      );

                      await fetchProfileData();
                      await fetchPostsAndConnections();
                    }}
                    className={Styles.connectBtn}
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>

            <p className={Styles.userBio}>{userProfile?.bio}</p>

            <div className={Styles.activitySection}>
              <h3 className={Styles.sectionTitle}>Recent Activity</h3>
              {userPosts.map((post) => (
                <div key={post._id} className={Styles.postCard}>
                  <div className={Styles.postFlex}>
                    {post.media && post.media.url ? (
                      <img
                        src={post.media.url}
                        alt="media"
                        className={Styles.postImg}
                      />
                    ) : null}
                    <p>{post.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}

export async function getServerSideProps(context) {
  const request = await clientServer.get("/user/get_profile_by_username", {
    params: {
      username: context.query.username,
    },
  });
  return { props: { initialUserProfile: request.data.profile || {} } };
}

export default ViewProfile;
