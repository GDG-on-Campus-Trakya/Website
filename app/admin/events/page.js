"use client";
// admin/events/page.js
import { useEffect, useState } from "react";
import { auth, db } from "../../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function AdminEventsPage() {
  const [user, loading] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);

  // Events & Sponsors
  const [events, setEvents] = useState([]);
  const [sponsors, setSponsors] = useState([]);

  // Event form management
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: "", // TODO: bunu sonra revize etmeliyiz ama çok da gerek yok
    name: "",
    description: "",
    date: "",
    time: "",
    imageUrl: "",
    location: "",
    sponsors: [],
    category: "Konferans",
  });

  const router = useRouter();

  // Check if user is admin
  useEffect(() => {
    const checkAdminPrivileges = async () => {
      if (!user) return;
      try {
        const adminRef = doc(db, "admins", user.email);
        const adminSnap = await getDoc(adminRef);

        if (adminSnap.exists()) {
          setIsAdmin(true);
        } else {
          router.push("/");
        }
      } catch (error) {
        console.error("Error checking admin privileges:", error);
        router.push("/");
      }
    };

    if (!loading && user) {
      checkAdminPrivileges();
    }
  }, [user, loading, router]);

  // Fetch events & sponsors
  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventsSnapshot = await getDocs(collection(db, "events"));
        const sponsorSnapshot = await getDocs(collection(db, "sponsors"));

        setEvents(
          eventsSnapshot.docs.map((doc) => ({
            firestoreId: doc.id,
            ...doc.data(),
          }))
        );

        setSponsors(
          sponsorSnapshot.docs.map((doc) => ({
            firestoreId: doc.id,
            ...doc.data(),
          }))
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  // Form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Add event
  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      const newEvent = {
        ...formData,
        id: events.length + 1,
      };
      const docRef = await addDoc(collection(db, "events"), newEvent);
      setEvents((prev) => [...prev, { firestoreId: docRef.id, ...newEvent }]);
      resetForm();
    } catch (error) {
      console.error("Error adding event:", error);
    }
  };

  // Edit event
  const handleEditEvent = (event) => {
    setIsEditing(true);
    setFormData(event);
  };

  // Update event
  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    try {
      const eventRef = doc(db, "events", String(formData.firestoreId));
      await setDoc(eventRef, { ...formData }, { merge: true });
      setEvents((prev) =>
        prev.map((event) =>
          event.firestoreId === formData.firestoreId ? formData : event
        )
      );
      resetForm();
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  // Delete event
  const handleDeleteEvent = async (firestoreId) => {
    try {
      await deleteDoc(doc(db, "events", firestoreId));
      setEvents((prev) =>
        prev.filter((event) => event.firestoreId !== firestoreId)
      );
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  // Reset form
  const resetForm = () => {
    setIsEditing(false);
    setFormData({
      id: "",
      name: "",
      description: "",
      date: "",
      time: "",
      imageUrl: "",
      location: "",
      sponsors: [],
      category: "Konferans",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-700">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-red-500">Access Denied</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Admin Panel - Events
      </h1>

      {/* Add / Edit Event Form */}
      <section className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">
          {isEditing ? "Edit Event" : "Add Event"}
        </h2>
        <form
          onSubmit={isEditing ? handleUpdateEvent : handleAddEvent}
          className="space-y-4"
        >
          <input
            type="text"
            name="name"
            placeholder="Event Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            name="description"
            placeholder="Event Description"
            value={formData.description}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            name="date"
            placeholder="Event Date"
            value={formData.date}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="time"
            name="time"
            placeholder="Event Time"
            value={formData.time}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="url"
            name="imageUrl"
            placeholder="Image URL"
            value={formData.imageUrl}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Category Dropdown */}
          <div>
            <label htmlFor="category" className="block text-gray-700 mb-2">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Konferans">Konferans</option>
              <option value="DevFest">DevFest</option>
              <option value="Gezi">Gezi</option>
              <option value="Eğitim">Eğitim</option>
            </select>
          </div>

          {/* Sponsors Dropdown */}
          <div>
            <label htmlFor="sponsors" className="block text-gray-700 mb-2">
              Sponsors
            </label>
            <div className="relative">
              <button
                type="button"
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-left"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                Select Sponsors
              </button>
              {isDropdownOpen && (
                <ul className="absolute z-10 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 w-full overflow-auto">
                  {sponsors.map((sponsor) => (
                    <li
                      key={sponsor.firestoreId}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        if (!formData.sponsors.includes(sponsor.firestoreId)) {
                          setFormData((prev) => ({
                            ...prev,
                            sponsors: [...prev.sponsors, sponsor.firestoreId],
                          }));
                        }
                        setIsDropdownOpen(false);
                      }}
                    >
                      {sponsor.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* Display selected sponsors */}
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.sponsors.map((sponsorId, index) => {
                const sponsor = sponsors.find(
                  (s) => s.firestoreId === sponsorId
                );
                return (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-gray-200 text-sm rounded-md"
                  >
                    {sponsor?.name || "Unknown Sponsor"}
                    <button
                      type="button"
                      className="ml-2 text-red-500"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          sponsors: prev.sponsors.filter(
                            (id) => id !== sponsorId
                          ),
                        }))
                      }
                    >
                      &times;
                    </button>
                  </span>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className={`w-full ${
              isEditing ? "bg-yellow-500" : "bg-green-500"
            } text-white py-2 rounded-md hover:bg-${
              isEditing ? "yellow-600" : "green-600"
            } transition-colors`}
          >
            {isEditing ? "Update Event" : "Add Event"}
          </button>
        </form>
      </section>

      {/* Manage Events */}
      <section className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">
          Manage Events
        </h2>
        {events.length === 0 ? (
          <p className="text-gray-500">No events found.</p>
        ) : (
          <ul className="space-y-4">
            {events.map((event) => (
              <li
                key={event.firestoreId}
                className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 p-4 rounded-md shadow-sm"
              >
                <div>
                  <p className="text-lg font-medium text-gray-800">
                    {event.name}
                  </p>
                  <p className="text-sm text-gray-600">{event.description}</p>
                </div>
                <div className="flex gap-2 mt-2 md:mt-0">
                  <button
                    onClick={() => handleEditEvent(event)}
                    className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event.firestoreId)}
                    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}