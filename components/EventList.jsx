// components/EventList.jsx

import React from "react";
import { toast } from "react-toastify";

const isExpired = (eventDate) => new Date(eventDate) < new Date();

// Updated formatDate function to accept options
const formatDate = (date, options = {}) => {
  const d = new Date(date);
  return d.toLocaleString("tr-TR", options);
};

const EventList = ({
  registrations,
  events,
  removeRegistration,
  qrCodes,
  downloadQRCode,
}) => {
  if (registrations.length === 0) {
    return (
      <p className="text-gray-400">Henüz bir etkinliğe kayıt olmadınız.</p>
    );
  }

  return (
    <ul className="list-none p-0 flex flex-col gap-5">
      {registrations.map((registration) => {
        const event = events.find((evt) => evt.id === registration.eventId);
        if (!event) return null;

        const signedUpDate = formatDate(
          registration.signedUpAt?.seconds * 1000 || Date.now(),
          {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }
        );

        const expired = isExpired(event.date);
        const status = expired ? "Geçmiş" : "Yaklaşan";
        const statusColor =
          status === "Yaklaşan" ? "bg-green-600" : "bg-red-600";

        return (
          <li
            key={registration.id}
            className="flex flex-col md:flex-row items-start md:items-center bg-gray-800 p-5 rounded-lg shadow-md space-y-4 md:space-y-0 md:space-x-6"
          >
            {/* Event Image */}
            <img
              src={event.imageUrl || "/default-event.png"}
              alt={event.name}
              className="w-32 h-32 object-cover rounded"
            />

            {/* Event Details */}
            <div className="flex-1">
              <h3 className="text-2xl font-semibold text-white">
                {event.name}
              </h3>
              <div className="mt-2">
                <p>
                  <strong>Etkinlik Tarihi:</strong>{" "}
                  {formatDate(event.date, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })} {event.time}
                </p>
                <p>
                  <strong>Etkinlik Lokasyonu:</strong> {event.location}
                </p>
                <p>
                  <strong>Kayıt Tarihi:</strong> {signedUpDate}
                </p>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {/* Category Tag */}
                <span className="inline-block px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                  {event.category}
                </span>
                {/* Status Tag */}
                <span
                  className={`inline-block px-3 py-1 text-white text-sm rounded-full ${statusColor}`}
                >
                  {status}
                </span>
              </div>
            </div>

            {/* QR Code and Actions */}
            {!expired && qrCodes[registration.qrCodeId] ? (
              <div className="mt-4 flex items-center gap-4">
                <img
                  src={qrCodes[registration.qrCodeId]}
                  alt="QR Code"
                  className="w-32 h-32"
                />
                <button
                  onClick={() =>
                    downloadQRCode(
                      qrCodes[registration.qrCodeId],
                      event.name
                    )
                  }
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Kodu İndir
                </button>
              </div>
            ) : (
              <p className="mt-4 text-gray-500">
                {expired
                  ? "Bu etkinlik sona erdiği için QR kodu mevcut değil."
                  : "QR kodu yükleniyor..."}
              </p>
            )}

            {/* Remove Button */}
            {!expired && (
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      "Etkinlik kaydınızı silmek istediğinize emin misiniz?"
                    )
                  ) {
                    removeRegistration(registration.id);
                  }
                }}
                className="mt-2 md:mt-0 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
              >
                Kayıt Sil
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default EventList;
