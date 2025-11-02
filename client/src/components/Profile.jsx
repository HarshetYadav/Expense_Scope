import React, { useEffect, useState } from "react";
import API from "../api/api.js";

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/auth/profile");
        setUser(res.data);
      } catch (err) {
        console.error(err);
        alert("Failed to load profile");
      }
    };

    fetchProfile();
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h2>Profile</h2>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Subscription Type:</strong> {user.subscriptionType}</p>
      {user.subscriptionType !== "free" && (
        <>
          <p><strong>Subscription Start:</strong> {new Date(user.subscriptionStart).toLocaleDateString()}</p>
          <p><strong>Subscription End:</strong> {new Date(user.subscriptionEnd).toLocaleDateString()}</p>
        </>
      )}
      <p><strong>Active Subscription:</strong> {user.isActiveSubscription ? "Yes" : "No"}</p>
    </div>
  );
};

export default Profile;
