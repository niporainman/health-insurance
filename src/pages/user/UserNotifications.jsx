import { useEffect, useState, useCallback, useRef } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  startAfter,
  doc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import UserHeader from "./UserHeader";
import Swal from "sweetalert2";

function formatReadableDate(ts) {
  if (!ts) return "";
  const date = ts.toDate ? ts.toDate() : ts;
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin} min${diffMin > 1 ? "s" : ""} ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString();
}

export default function UserNotifications() {
  const [notifications, setNotifications] = useState([]);
  const pagesCacheRef = useRef([]); // pagesCacheRef.current[pageIndex] = array of items
  const cursorsRef = useRef([]); // cursorsRef.current[pageIndex] = lastDoc snapshot for that page (or null)
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const pageSize = 10;

  // stable fetchPage that uses refs (so it doesn't depend on state that changes every fetch)
  const fetchPage = useCallback(
    async (uid, pageIndex = 0) => {
      if (!uid) return;

      // If we have cached page, use it (fast back/forward)
      if (pagesCacheRef.current[pageIndex]) {
        setNotifications(pagesCacheRef.current[pageIndex]);
        setCurrentPage(pageIndex);
        setHasPrev(pageIndex > 0);
        // hasNext true if we had a cursor for this page (i.e. was a full page)
        setHasNext(Boolean(cursorsRef.current[pageIndex]));
        return;
      }

      setLoading(true);
      try {
        let q = query(
          collection(db, "notifications"),
          where("userId", "==", uid),
          orderBy("createdAt", "desc"),
          limit(pageSize)
        );

        // If not first page and we have a cursor for previous page, startAfter that cursor
        if (pageIndex > 0 && cursorsRef.current[pageIndex - 1]) {
          q = query(
            collection(db, "notifications"),
            where("userId", "==", uid),
            orderBy("createdAt", "desc"),
            startAfter(cursorsRef.current[pageIndex - 1]),
            limit(pageSize)
          );
        }

        const snapshot = await getDocs(q);
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

        // Cache the page
        pagesCacheRef.current[pageIndex] = items;

        // If we got a full page, save cursor for page (used to fetch the next page)
        if (snapshot.docs.length === pageSize) {
          cursorsRef.current[pageIndex] =
            snapshot.docs[snapshot.docs.length - 1];
          setHasNext(true);
        } else {
          // no more pages after this
          cursorsRef.current[pageIndex] = null;
          setHasNext(false);
        }

        setNotifications(items);
        setCurrentPage(pageIndex);
        setHasPrev(pageIndex > 0);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        Swal.fire("Error", "Could not load notifications", "error");
      } finally {
        setLoading(false);
      }
    },
    [pageSize] // only depends on pageSize (a constant)
  );

  // initial load and when auth changes
  useEffect(() => {
    document.title = import.meta.env.VITE_COMPANY_NAME + " | Notifications";

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // reset cache on auth change
      pagesCacheRef.current = [];
      cursorsRef.current = [];
      setNotifications([]);
      setCurrentPage(0);
      setHasNext(false);
      setHasPrev(false);

      if (user) {
        fetchPage(user.uid, 0);
      }
    });

    return () => unsubscribe();
  }, [fetchPage]);

  const handleNext = () => {
    if (!auth.currentUser || loading) return;
    fetchPage(auth.currentUser.uid, currentPage + 1);
  };

  const handlePrev = () => {
    if (!auth.currentUser || loading || currentPage === 0) return;
    fetchPage(auth.currentUser.uid, currentPage - 1);
  };

  // mark single notification as read
  const markAsRead = async (id) => {
    try {
      const ref = doc(db, "notifications", id);
      await updateDoc(ref, { read: true });

      // update cached pages and UI immediately (so user sees change)
      pagesCacheRef.current = pagesCacheRef.current.map((pageArr) =>
        pageArr.map((item) => (item.id === id ? { ...item, read: true } : item))
      );

      // refresh visible page
      const page = pagesCacheRef.current[currentPage] || [];
      setNotifications(page);
      Swal.fire("Done", "Notification marked as read", "success");
    } catch (err) {
      console.error("Error marking notification read:", err);
      Swal.fire("Error", "Could not mark notification", "error");
    }
  };

  return (
    <>
      <UserHeader page_title="Notifications" />
      <div className="db-content-box bg-white round-10 mb-25 pb-3">
        <div className="db-content-box-header d-flex flex-wrap align-items-center justify-content-between mb-20">
          <h4 className="fs-17 fw-bold text-title fw-extrabold mb-sm-10 mb-md-0 w-75">
            Notification List
          </h4>

          <div>
            <small className="text-muted">
              Page: {currentPage + 1}
            </small>
          </div>
        </div>

        <div className="db-table style-three table-responsive">
          {loading ? (
            <div className="p-3">Loading...</div>
          ) : (
            <table className="table text-nowrap align-middle mb-30">
              <thead>
                <tr>
                  <th>Notification Details</th>
                  <th>Action</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <tr key={n.id} className={!n.read ? "" : ""}>
                      <td>
                        <span className="notification-text fs-16 text-para position-relative">
                          <i className="fa-solid fa-bell me-1"></i>
                          {n.title}
                          <br />
                          <span className="fs-13 text-secondary">{n.message}</span>
                        </span>
                      </td>
                      <td>
                        {!n.read ? (
                          <button
                            className="btn btn-primary btn-xs"
                            onClick={() => markAsRead(n.id)}
                          >
                            Mark as Read
                          </button>
                        ) : (
                          <span className="badge bg-success">Read</span>
                        )}
                      </td>
                      <td>
                        <span className="fs-13 lh-1 text-para">
                          {formatReadableDate(n.createdAt)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center text-secondary py-3">
                      No notifications found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          <div className="d-flex justify-content-between px-3 pb-3">
            <button
              onClick={handlePrev}
              className="btn btn-sm btn-outline-secondary"
              disabled={!hasPrev || loading}
            >
              Previous
            </button>

            <div>
              <button
                onClick={handleNext}
                className="btn btn-sm btn-outline-secondary"
                disabled={!hasNext || loading}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}