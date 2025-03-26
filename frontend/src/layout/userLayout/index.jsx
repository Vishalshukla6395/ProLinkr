import Navbar from "@/Components/Navbar";

function UserLayout({ children }) {
  return (
    <div>
      <Navbar />
      {children}
    </div>
  );
}

export default UserLayout;
