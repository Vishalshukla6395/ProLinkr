import styles from "@/styles/Home.module.css";
import { useRouter } from "next/router";
import UserLayout from "@/layout/userLayout";

export default function Home() {
  const router = useRouter();

  return (
    <UserLayout>
      <div className={styles.heroSection}>
        <div className={styles.mainContainer}>
          <div className={styles.mainContainer_left}>
            <h1 className={styles.headline}>
              Connect with <span>friends</span> without exaggeration
            </h1>
            <p className={styles.subHeadline}>
              Join a platform that values authenticity over hype.
            </p>
            <button
              onClick={() => router.push("/login")}
              className={styles.exploreButton}
            >
              Explore
            </button>
          </div>
          <div className={styles.mainContainer_right}>
            <img
              src="images/homepage_connections_image.jpg"
              alt="connections_image"
            />
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
