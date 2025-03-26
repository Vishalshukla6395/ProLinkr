import clientServer from "@/config/index";
import UserLayout from "@/layout/userLayout";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
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

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const getProfileImage = (profilePicture) =>
  profilePicture && profilePicture.url ? profilePicture.url : "";

const getPostMedia = (media) => (media && media.url ? media.url : "");

function ViewProfile({ userProfile }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const authState = useSelector((state) => state.auth);
  const postReducer = useSelector((state) => state.post);
  const dispatch = useDispatch();

  const [userPosts, setUserPosts] = useState([]);
  const [isCurrentUserInConnection, setIsCurrentUserInConnection] =
    useState(false);
  const [isConnectionNull, setIsConnectionNull] = useState(true);

  const getUsersPost = async () => {
    await dispatch(allPosts());
    await dispatch(
      getConnectionRequests({ token: localStorage.getItem("token") })
    );
    await dispatch(
      getMyConnectionRequests({ token: localStorage.getItem("token") })
    );
  };

  useEffect(() => {
    const filtered = postReducer.posts.filter(
      (p) => p.userId.username === router.query.username
    );
    setUserPosts(filtered);
  }, [postReducer.posts, router.query.username]);

  useEffect(() => {
    if (
      authState.connections.some(
        (c) => c.connectionId._id === userProfile.userId._id
      )
    ) {
      setIsCurrentUserInConnection(true);
      if (
        authState.connections.find(
          (c) => c.connectionId._id === userProfile.userId._id
        ).status_accepted === true
      ) {
        setIsConnectionNull(false);
      }
    }
    if (
      authState.connectionRequest.some(
        (c) => c.userId._id === userProfile.userId._id
      )
    ) {
      setIsCurrentUserInConnection(true);
      if (
        authState.connectionRequest.find(
          (c) => c.userId._id === userProfile.userId._id
        ).status_accepted === true
      ) {
        setIsConnectionNull(false);
      }
    }
  }, [
    authState.connections,
    authState.connectionRequest,
    userProfile.userId._id,
  ]);

  useEffect(() => {
    getUsersPost();
  }, []);

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={Styles.container}>
          <div className={Styles.bannerArea}>
            <div className={Styles.bannerOverlay} />
            <img
              src={getProfileImage(userProfile.userId.profilePicture)}
              alt="profile_pic"
              className={Styles.profilePic}
            />
          </div>

          <div className={Styles.profileContent}>
            <div className={Styles.userHeader}>
              <div className={Styles.nameSection}>
                <h2 className={Styles.userName}>{userProfile.userId.name}</h2>
                <p className={Styles.username}>
                  @{userProfile.userId.username}
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
                          userId: userProfile.userId._id,
                        })
                      );
                      await dispatch(getConnectionRequests());
                    }}
                    className={Styles.connectBtn}
                  >
                    Connect
                  </button>
                )}
                <div
                  className={Styles.downloadIcon}
                  onClick={async () => {
                    const response = await clientServer.get(
                      `/user/download_resume?id=${userProfile.userId._id}`
                    );
                    window.open(`${response.data.message}`, "_blank");
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12
                        L12 16.5m0 0L7.5 12m4.5 4.5V3"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <p className={Styles.userBio}>{userProfile.bio}</p>

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

            <div className={Styles.infoSection}>
              <h3 className={Styles.sectionTitle}>Professional Experience</h3>
              <div className={Styles.cardContainer}>
                {userProfile?.pastWork?.length > 0 ? (
                  userProfile.pastWork.map((work, index) => (
                    <div key={index} className={Styles.infoCard}>
                      <p className={Styles.cardTitle}>
                        {work.company} - {work.position}
                      </p>
                      <p className={Styles.cardSubtitle}>{work.years}</p>
                    </div>
                  ))
                ) : (
                  <p className={Styles.placeholderText}>
                    No professional experience available
                  </p>
                )}
              </div>
            </div>

            <div className={Styles.infoSection}>
              <h3 className={Styles.sectionTitle}>Education</h3>
              <div className={Styles.cardContainer}>
                {userProfile?.education?.length > 0 ? (
                  userProfile.education.map((edu, index) => (
                    <div key={index} className={Styles.infoCard}>
                      <p className={Styles.cardTitle}>
                        {edu.school} - {edu.degree}
                      </p>
                      <p className={Styles.cardSubtitle}>{edu.fieldOfStudy}</p>
                    </div>
                  ))
                ) : (
                  <p className={Styles.placeholderText}>
                    No educational background available
                  </p>
                )}
              </div>
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
  return { props: { userProfile: request.data.profile || {} } };
}

export default ViewProfile;
