import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Star, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { useAllReviews, useDeleteReview } from "../../hooks/useQueries";

function StarRating({ rating }: { rating: bigint }) {
  const n = Number(rating);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3.5 h-3.5 ${
            s <= n
              ? "fill-yellow-400 text-yellow-400"
              : "text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

export default function AdminReviews() {
  const { data: reviews, isLoading } = useAllReviews();
  const deleteReview = useDeleteReview();

  const handleDelete = async (reviewId: string) => {
    try {
      await deleteReview.mutateAsync(reviewId);
      toast.success("Review deleted");
    } catch {
      toast.error("Failed to delete review");
    }
  };

  const allReviews = reviews || [];

  const formatDate = (ns: bigint) => {
    const ms = Number(ns) / 1_000_000;
    return new Date(ms).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">Reviews</h1>
        <p className="text-muted-foreground font-body text-sm">
          {allReviews.length} review{allReviews.length !== 1 ? "s" : ""} total
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-body py-6">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Loading reviews…
        </div>
      ) : allReviews.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-dashed border-border rounded-xl p-16 flex flex-col items-center text-center"
        >
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <MessageSquare className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <h3 className="font-display text-lg font-semibold mb-2">
            No reviews yet
          </h3>
          <p className="text-muted-foreground font-body text-sm max-w-xs">
            Customer reviews will appear here once products have been reviewed.
          </p>
        </motion.div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold font-body text-muted-foreground uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold font-body text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                    Product ID
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold font-body text-muted-foreground uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold font-body text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                    Comment
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold font-body text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                    Date
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold font-body text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {allReviews.map((review) => (
                    <motion.tr
                      key={review.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-b border-border hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-body font-medium text-sm">
                            {review.userName}
                          </p>
                          <p className="text-xs text-muted-foreground font-body truncate max-w-[120px]">
                            {review.userId.toString().slice(0, 12)}…
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <Badge variant="outline" className="text-xs font-mono">
                          {review.productId.slice(0, 16)}…
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <StarRating rating={review.rating} />
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-sm font-body text-muted-foreground line-clamp-2 max-w-[200px]">
                          {review.comment || (
                            <span className="italic">No comment</span>
                          )}
                        </p>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-xs text-muted-foreground font-body">
                          {formatDate(review.createdAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="font-display">
                                  Delete Review?
                                </AlertDialogTitle>
                                <AlertDialogDescription className="font-body">
                                  This will permanently delete{" "}
                                  <strong>{review.userName}'s</strong> review.
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="font-body">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(review.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-body"
                                >
                                  Delete Review
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
