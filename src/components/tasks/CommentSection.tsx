"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { Comment } from "@/types";
import { Button, Textarea } from "@/components/ui";

interface CommentSectionProps {
  taskId: number;
  onCommentAdded?: () => void;
}

/**
 * Comment section for task detail page.
 *
 * Features:
 * - Displays existing comments (newest first)
 * - Add new comment form
 * - Handles loading and error states
 */
export function CommentSection({ taskId, onCommentAdded }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New comment form state
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Fetch comments for this task
   */
  const fetchComments = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(`/api/tasks/${taskId}/comments`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch comments");
      }

      setComments(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load comments");
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  /**
   * Submit new comment
   */
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment.trim() }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to add comment");
      }

      // Add new comment to list and clear form
      setComments((prev) => [result.data, ...prev]);
      setNewComment("");
      
      // Notify parent component that a comment was added
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  }

  /**
   * Format date for display
   */
  function formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Comments</h2>

      {/* Add comment form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          rows={3}
          className="mb-2"
        />
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          disabled={!newComment.trim()}
        >
          Add Comment
        </Button>
      </form>

      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-4 text-gray-500">
          Loading comments...
        </div>
      )}

      {/* Error state */}
      {error && <div className="text-center py-4 text-red-500">{error}</div>}

      {/* Comments list */}
      {!isLoading && !error && (
        <>
          {comments.length === 0 ? (
            <p className="text-gray-500 text-sm">No comments yet.</p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {comment.author_email || "Anonymous"}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
