import { useEffect, useRef, useState } from "react";
import {
  getPostBySectionAndSlug,
  getPostPreviewsBySection,
  type PostDetail,
  type PostPreview,
  type PostSection,
} from "./sanityContent";

export type LoadStatus = "loading" | "ready" | "error";
export type DetailStatus = "idle" | LoadStatus;

export function usePostRegister(section: PostSection) {
  const [posts, setPosts] = useState<PostPreview[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<PostDetail | null>(null);
  const [detailStatus, setDetailStatus] = useState<DetailStatus>("idle");
  const detailRequestId = useRef(0);

  useEffect(() => {
    let active = true;

    async function loadPosts() {
      setStatus("loading");

      try {
        const postPreviews = await getPostPreviewsBySection(section);

        if (!active) {
          return;
        }

        setPosts(postPreviews);
        setSelectedSlug((currentSlug) => currentSlug ?? postPreviews[0]?.slug ?? null);
        setStatus("ready");
      } catch (error) {
        if (!active) {
          return;
        }

        console.error(`Failed to load ${section} posts from Sanity`, error);
        setStatus("error");
      }
    }

    loadPosts();

    return () => {
      active = false;
    };
  }, [section]);

  useEffect(() => {
    const requestId = detailRequestId.current + 1;
    detailRequestId.current = requestId;

    if (!selectedSlug) {
      setSelectedPost(null);
      setDetailStatus("idle");
      return;
    }

    let active = true;
    const slug = selectedSlug;

    async function loadSelectedPost() {
      try {
        setDetailStatus("loading");
        const nextPost = await getPostBySectionAndSlug(section, slug);

        if (!active || detailRequestId.current !== requestId) {
          return;
        }

        setSelectedPost(nextPost);
        setDetailStatus("ready");
      } catch (error) {
        if (!active || detailRequestId.current !== requestId) {
          return;
        }

        console.error(`Failed to load selected ${section} record`, error);
        setSelectedPost(null);
        setDetailStatus("error");
      }
    }

    loadSelectedPost();

    return () => {
      active = false;
    };
  }, [section, selectedSlug]);

  return {
    posts,
    status,
    selectedSlug,
    selectedPost,
    detailStatus,
    selectPost: setSelectedSlug,
  };
}
