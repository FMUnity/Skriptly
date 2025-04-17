
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore, doc, setDoc, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCMn9IwBBqA_N3cGbPMQ-6B-xredjVmgvs",
  authDomain: "scriptly-8e05c.firebaseapp.com",
  projectId: "scriptly-8e05c",
  storageBucket: "scriptly-8e05c.firebasestorage.app",
  messagingSenderId: "935619582212",
  appId: "1:935619582212:web:b5bc28bf39369e9c02d851"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("profile").style.display = "block";
    loadUserProfile(user.uid);
  } else {
    window.location.href = "index.html";
  }
});

async function loadUserProfile(userId) {
  const userRef = doc(db, "users", userId);
  const userDoc = await getDoc(userRef);
  if (userDoc.exists()) {
    document.getElementById("username").value = userDoc.data().username || "";
    document.getElementById("profileImage").src = userDoc.data().profileImage || "";
  }
}

document.getElementById("saveProfile").addEventListener("click", async () => {
  const user = auth.currentUser;
  const username = document.getElementById("username").value;
  const file = document.getElementById("profileImage").files[0];

  if (file) {
    const storageRef = ref(storage, `profile_images/${user.uid}`);
    await uploadBytes(storageRef, file);
    const imageUrl = await getDownloadURL(storageRef);
    await setDoc(doc(db, "users", user.uid), { username: username, profileImage: imageUrl });
  } else {
    await setDoc(doc(db, "users", user.uid), { username: username });
  }
  alert("Profilo aggiornato!");
});

document.getElementById("publishAnnouncement").addEventListener("click", async () => {
  const text = document.getElementById("announcementText").value;
  if (text) {
    await addDoc(collection(db, "announcements"), {
      userId: auth.currentUser.uid,
      text: text,
      timestamp: new Date()
    });
    loadAnnouncements();
  }
});

async function loadAnnouncements() {
  const querySnapshot = await getDocs(collection(db, "announcements"));
  const announcementsDiv = document.getElementById("announcements");
  announcementsDiv.innerHTML = "";
  querySnapshot.forEach((doc) => {
    const announcement = doc.data();
    const div = document.createElement("div");
    div.innerHTML = `<p>${announcement.text}</p><small>Pubblicato il ${new Date(announcement.timestamp.seconds * 1000).toLocaleString()}</small>`;
    announcementsDiv.appendChild(div);
  });
}
