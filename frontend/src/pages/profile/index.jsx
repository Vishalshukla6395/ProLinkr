import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAboutUser } from "@/config/redux/action/authAction";
import { allPosts } from "@/config/redux/action/postAction";
import clientServer from "@/config";
import UserLayout from "@/layout/userLayout";
import DashboardLayout from "@/layout/dashboardLayout";
import Styles from "./profile.module.css";

const getPostMedia = (media) => {
  return media && media.url ? media.url : "";
};

export default function ProfilePage() {
  const authState = useSelector((state) => state.auth);
  const postReducer = useSelector((state) => state.post);
  const dispatch = useDispatch();
  const [userProfile, setUserProfile] = useState({});
  const [userPosts, setUserPosts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [workModalOpen, setWorkModalOpen] = useState(false);
  const [eduModalOpen, setEduModalOpen] = useState(false);
  const [workInput, setWorkInput] = useState({
    company: "",
    position: "",
    years: "",
  });
  const [eduInput, setEduInput] = useState({
    school: "",
    degree: "",
    fieldOfStudy: "",
  });

  useEffect(() => {
    dispatch(getAboutUser({ token: localStorage.getItem("token") }));
    dispatch(allPosts());
  }, [dispatch]);

  useEffect(() => {
    if (authState.user) {
      setUserProfile(authState.user);
      const filtered = postReducer.posts.filter(
        (p) => p.userId.username === authState.user.userId.username
      );
      setUserPosts(filtered);
    }
  }, [authState.user, postReducer.posts]);

  const updateProfilePicture = async (file) => {
    const formData = new FormData();
    formData.append("profile_picture", file);
    formData.append("token", localStorage.getItem("token"));
    await clientServer.post("/update_profile_picture", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    dispatch(getAboutUser({ token: localStorage.getItem("token") }));
  };

  const updateProfileData = async () => {
    await clientServer.post("/user_update", {
      token: localStorage.getItem("token"),
      name: userProfile.userId.name,
    });
    await clientServer.post("/update_profile_data", {
      token: localStorage.getItem("token"),
      bio: userProfile.bio,
      currentPost: userProfile.currentPost,
      pastWork: userProfile.pastWork,
      education: userProfile.education,
    });
    dispatch(getAboutUser({ token: localStorage.getItem("token") }));
    setIsEditing(false);
  };

  const getProfileImage = (profilePicture) =>
    profilePicture && profilePicture.url ? profilePicture.url : "";

  return (
    <UserLayout>
      <DashboardLayout>
        {authState.user && userProfile.userId && (
          <div className={Styles.container}>
            <div className={Styles.banner} />
            <div className={Styles.profilePicContainer}>
              <img
                src={userProfile.userId.profilePicture?.url}
                alt="profile_pic"
                className={Styles.profilePic}
              />
              <label htmlFor="profilePictureUpload" className={Styles.plusIcon}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className={Styles.plusIconSvg}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
              </label>
              <input
                type="file"
                id="profilePictureUpload"
                hidden
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    updateProfilePicture(e.target.files[0]);
                  }
                }}
              />
            </div>
            <div className={Styles.content}>
              <div className={Styles.leftSide}>
                <div className={Styles.profileHeader}>
                  <div className={Styles.nameContainer}>
                    {!isEditing ? (
                      <h2 className={Styles.profileName}>
                        {userProfile.userId.name}
                      </h2>
                    ) : (
                      <input
                        className={Styles.nameInput}
                        value={userProfile.userId.name}
                        onChange={(e) =>
                          setUserProfile({
                            ...userProfile,
                            userId: {
                              ...userProfile.userId,
                              name: e.target.value,
                            },
                          })
                        }
                      />
                    )}
                    <p className={Styles.username}>
                      @{userProfile.userId.username}
                    </p>
                  </div>
                  <div className={Styles.actionButtons}>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className={Styles.editBtn}
                      >
                        Edit Profile
                      </button>
                    ) : (
                      <button
                        onClick={updateProfileData}
                        className={Styles.submitBtn}
                      >
                        Submit Changes
                      </button>
                    )}
                  </div>
                </div>
                <div
                  className={
                    isEditing ? Styles.editableField : Styles.viewField
                  }
                >
                  {!isEditing ? (
                    <p className={Styles.bioText}>{userProfile.bio}</p>
                  ) : (
                    <textarea
                      className={Styles.bioEdit}
                      value={userProfile.bio}
                      onChange={(e) =>
                        setUserProfile({ ...userProfile, bio: e.target.value })
                      }
                    />
                  )}
                </div>
                <div className={Styles.recentActivity}>
                  <h3 className={Styles.sectionTitle}>Recent Activity</h3>
                  {userPosts.map((post) => (
                    <div key={post._id} className={Styles.postCard}>
                      <div className={Styles.postFlex}>
                        {getPostMedia(post.media) && (
                          <div className={Styles.singleCard_image}>
                            <img
                              src={getPostMedia(post.media)}
                              alt="post media"
                              className={Styles.postImg}
                            />
                          </div>
                        )}
                        <p>{post.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className={Styles.sectionBlock}>
              <div className={Styles.sectionHeader}>
                <h4 className={Styles.sectionTitle}>Professional Experience</h4>
                {isEditing && (
                  <button
                    className={Styles.addBtn}
                    onClick={() => setWorkModalOpen(true)}
                  >
                    Add Work
                  </button>
                )}
              </div>
              <div className={Styles.cardsContainer}>
                {userProfile?.pastWork?.length > 0 ? (
                  userProfile.pastWork.map((work, index) => (
                    <div key={index} className={Styles.infoCard}>
                      <p className={Styles.cardTitle}>
                        {work.company} - {work.position}
                      </p>
                      <p>{work.years} years</p>
                    </div>
                  ))
                ) : (
                  <p className={Styles.placeholderText}>
                    No work history available
                  </p>
                )}
              </div>
            </div>
            <div className={Styles.sectionBlock}>
              <div className={Styles.sectionHeader}>
                <h4 className={Styles.sectionTitle}>Education</h4>
                {isEditing && (
                  <button
                    className={Styles.addBtn}
                    onClick={() => setEduModalOpen(true)}
                  >
                    Add Education
                  </button>
                )}
              </div>
              <div className={Styles.cardsContainer}>
                {userProfile?.education?.length > 0 ? (
                  userProfile.education.map((edu, index) => (
                    <div key={index} className={Styles.infoCard}>
                      <p className={Styles.cardTitle}>
                        {edu.school} - {edu.degree}
                      </p>
                      <p className={Styles.cardSubtitle}>
                        {edu.fieldOfStudy || "N/A"}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className={Styles.placeholderText}>
                    No education available
                  </p>
                )}
              </div>
            </div>
            {workModalOpen && (
              <div
                className={Styles.modalOverlay}
                onClick={() => setWorkModalOpen(false)}
              >
                <div
                  className={Styles.modalContent}
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    placeholder="Enter Company"
                    type="text"
                    onChange={(e) =>
                      setWorkInput({ ...workInput, company: e.target.value })
                    }
                    className={Styles.modalInput}
                  />
                  <input
                    placeholder="Enter Position"
                    type="text"
                    onChange={(e) =>
                      setWorkInput({ ...workInput, position: e.target.value })
                    }
                    className={Styles.modalInput}
                  />
                  <input
                    placeholder="Years"
                    type="number"
                    onChange={(e) =>
                      setWorkInput({ ...workInput, years: e.target.value })
                    }
                    className={Styles.modalInput}
                  />
                  <button
                    className={Styles.saveBtn}
                    onClick={() => {
                      setUserProfile({
                        ...userProfile,
                        pastWork: [...(userProfile.pastWork || []), workInput],
                      });
                      setWorkModalOpen(false);
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
            {eduModalOpen && (
              <div
                className={Styles.modalOverlay}
                onClick={() => setEduModalOpen(false)}
              >
                <div
                  className={Styles.modalContent}
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    placeholder="Enter Institution"
                    type="text"
                    onChange={(e) =>
                      setEduInput({ ...eduInput, school: e.target.value })
                    }
                    className={Styles.modalInput}
                  />
                  <input
                    placeholder="Enter Degree"
                    type="text"
                    onChange={(e) =>
                      setEduInput({ ...eduInput, degree: e.target.value })
                    }
                    className={Styles.modalInput}
                  />
                  <input
                    placeholder="Enter Field of Study"
                    type="text"
                    onChange={(e) =>
                      setEduInput({ ...eduInput, fieldOfStudy: e.target.value })
                    }
                    className={Styles.modalInput}
                  />
                  <button
                    className={Styles.saveBtn}
                    onClick={() => {
                      setUserProfile({
                        ...userProfile,
                        education: [...(userProfile.education || []), eduInput],
                      });
                      setEduModalOpen(false);
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </DashboardLayout>
    </UserLayout>
  );
}
