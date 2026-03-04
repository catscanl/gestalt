import { INITIAL_GESTALTS } from "../data";
import { hasSupabaseEnv, supabase } from "./supabase";

function formatRelativeTime(isoString) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(isoString));
  } catch {
    return "Just now";
  }
}

function mapRows(rows) {
  return rows.map((row) => ({
    id: row.id,
    phrase: row.phrase,
    source: row.source || "",
    meaning: row.meaning,
    status: row.status,
    flaggedForSlt: row.flagged_for_slt,
    createdAt: row.created_at,
    comments: (row.comments || []).map((comment) => ({
      id: comment.id,
      author: comment.author,
      text: comment.text,
      role: comment.role,
      time: formatRelativeTime(comment.created_at),
    })),
  }));
}

export async function fetchGestalts() {
  if (!hasSupabaseEnv) {
    return INITIAL_GESTALTS;
  }

  const { data, error } = await supabase
    .from("gestalts")
    .select("id, phrase, source, meaning, status, flagged_for_slt, created_at, comments(id, author, text, role, created_at)")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return mapRows(data || []);
}

export async function fetchCollaborator() {
  if (!hasSupabaseEnv) {
    return null;
  }

  const { data, error } = await supabase
    .from("collaborators")
    .select("email, full_name, role")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function createGestalt(payload) {
  if (!hasSupabaseEnv) {
    return {
      ...payload,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      comments: [],
    };
  }

  const { data, error } = await supabase
    .from("gestalts")
    .insert({
      phrase: payload.phrase,
      source: payload.source,
      meaning: payload.meaning,
      status: payload.status,
      flagged_for_slt: payload.flaggedForSlt,
    })
    .select("id, phrase, source, meaning, status, flagged_for_slt, created_at, comments(id, author, text, role, created_at)")
    .single();

  if (error) {
    throw error;
  }

  return mapRows([data])[0];
}

export async function deleteGestalt(id) {
  if (!hasSupabaseEnv) {
    return;
  }

  const { error } = await supabase.from("gestalts").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

export async function addComment(gestaltId, payload) {
  if (!hasSupabaseEnv) {
    return {
      id: crypto.randomUUID(),
      author: payload.author,
      text: payload.text,
      role: payload.role,
      time: "Just now",
    };
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({
      gestalt_id: gestaltId,
      author: payload.author,
      text: payload.text,
      role: payload.role,
    })
    .select("id, author, text, role, created_at")
    .single();

  if (error) {
    throw error;
  }

  return {
    id: data.id,
    author: data.author,
    text: data.text,
    role: data.role,
    time: formatRelativeTime(data.created_at),
  };
}

export async function toggleFlag(gestaltId, nextFlaggedValue) {
  if (!hasSupabaseEnv) {
    return;
  }

  const { error } = await supabase
    .from("gestalts")
    .update({ flagged_for_slt: nextFlaggedValue })
    .eq("id", gestaltId);

  if (error) {
    throw error;
  }
}
