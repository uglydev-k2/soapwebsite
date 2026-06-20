"use client";

import { useCallback, useEffect, useState } from "react";
import { useToastStore } from "@/store/toastStore";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

type Review = {
  id: string;
  productSlug: string;
  authorName: string;
  title: string;
  body: string;
  rating: number;
  status: string;
  createdAt: string;
};

export default function ReviewsPageClient() {
  const addToast = useToastStore((s) => s.addToast);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState("PENDING");

  const load = useCallback(() => {
    fetch(`/api/admin/reviews?status=${filter}`)
      .then((r) => r.json())
      .then((res) => setReviews(res.data ?? []));
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const moderate = async (id: string, status: "APPROVED" | "REJECTED") => {
    const res = await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (!res.ok) {
      addToast("Could not update review", "error");
      return;
    }
    addToast(status === "APPROVED" ? "Review approved" : "Review rejected");
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {["PENDING", "APPROVED", "REJECTED"].map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            className={`px-4 py-2 text-xs label-caps border ${
              filter === status
                ? "border-terra bg-terra text-white"
                : "border-green/15 text-muted"
            }`}
          >
            {status.toLowerCase()}
          </button>
        ))}
      </div>

      {reviews.length === 0 ? (
        <p className="text-sm text-muted">No {filter.toLowerCase()} reviews.</p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li key={review.id} className="admin-card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="label-caps text-muted">{review.productSlug}</p>
                  <h3 className="font-serif text-xl text-green">{review.title}</h3>
                  <p className="mt-2 text-sm text-muted">{review.body}</p>
                  <p className="mt-3 text-sm">
                    {review.authorName} · {review.rating}/5 · {formatDate(review.createdAt)}
                  </p>
                </div>
                {review.status === "PENDING" && (
                  <div className="flex gap-2">
                    <Button variant="primary" onClick={() => moderate(review.id, "APPROVED")}>
                      Approve
                    </Button>
                    <Button variant="outline" onClick={() => moderate(review.id, "REJECTED")}>
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
