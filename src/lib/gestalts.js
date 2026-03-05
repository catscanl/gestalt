import { INITIAL_GESTALTS } from "../data";
import { hasSupabaseEnv, supabase } from "./supabase";

const BASE_SELECT =
  "id, phrase, source, meaning, status, flagged_for_slt, created_by, created_by_role, created_at, comments(id, author, text, role, created_at)";
const EXTENDED_SELECT =
  "id, phrase, source, meaning, communication_function, model_options, stage, date_of_entry, inactive_date, status, flagged_for_slt, created_by, created_by_role, created_at, comments(id, author, text, role, created_at)";

let supportsExtendedFields = null;

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
    communicationFunction: row.communication_function || "",
    modelOptions: row.model_options || "",
    stage: row.stage || "",
    dateOfEntry: row.date_of_entry || "",
    inactiveDate: row.inactive_date || "",
    status: row.status,
    flaggedForSlt: row.flagged_for_slt,
    createdBy: row.created_by || "Unknown",
    createdByRole: row.created_by_role || "Contributor",
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

function isMissingColumnError(error) {
  const message = (error?.message || "").toLowerCase();
  return message.includes("does not exist") && message.includes("gestalts.");
}

async function getGestaltSelectClause() {
  if (!hasSupabaseEnv) {
    return BASE_SELECT;
  }

  if (supportsExtendedFields !== null) {
    return supportsExtendedFields ? EXTENDED_SELECT : BASE_SELECT;
  }

  const { error } = await supabase
    .from("gestalts")
    .select("id, communication_function, model_options, stage, date_of_entry, inactive_date")
    .limit(1);

  if (!error) {
    supportsExtendedFields = true;
    return EXTENDED_SELECT;
  }

  if (isMissingColumnError(error)) {
    supportsExtendedFields = false;
    return BASE_SELECT;
  }

  throw error;
}

function getInsertOrUpdatePayload(payload, includeExtendedFields) {
  const basePayload = {
    phrase: payload.phrase,
    source: payload.source,
    meaning: payload.meaning,
    status: payload.status,
    flagged_for_slt: payload.flaggedForSlt,
    created_by: payload.createdBy,
    created_by_role: payload.createdByRole,
  };

  if (!includeExtendedFields) {
    return basePayload;
  }

  return {
    ...basePayload,
    communication_function: payload.communicationFunction,
    model_options: payload.modelOptions,
    stage: payload.stage,
    date_of_entry: payload.dateOfEntry || null,
    inactive_date: payload.inactiveDate || null,
  };
}

export async function fetchGestalts() {
  if (!hasSupabaseEnv) {
    return INITIAL_GESTALTS;
  }

  const selectClause = await getGestaltSelectClause();

  const { data, error } = await supabase
    .from("gestalts")
    .select(selectClause)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return mapRows(data || []);
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

  const selectClause = await getGestaltSelectClause();
  const includeExtendedFields = selectClause === EXTENDED_SELECT;

  const { data, error } = await supabase
    .from("gestalts")
    .insert(getInsertOrUpdatePayload(payload, includeExtendedFields))
    .select(selectClause)
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

export async function updateGestalt(id, payload) {
  const normalized = {
    id,
    phrase: payload.phrase,
    source: payload.source || "",
    meaning: payload.meaning,
    communicationFunction: payload.communicationFunction || "",
    modelOptions: payload.modelOptions || "",
    stage: payload.stage || "",
    dateOfEntry: payload.dateOfEntry || "",
    inactiveDate: payload.inactiveDate || "",
    status: payload.status,
    flaggedForSlt: payload.flaggedForSlt,
    createdBy: payload.createdBy || "Unknown",
    createdByRole: payload.createdByRole || "Contributor",
    createdAt: payload.createdAt || new Date().toISOString(),
    comments: payload.comments || [],
  };

  if (!hasSupabaseEnv) {
    return normalized;
  }

  const selectClause = await getGestaltSelectClause();
  const includeExtendedFields = selectClause === EXTENDED_SELECT;

  const { error } = await supabase
    .from("gestalts")
    .update(getInsertOrUpdatePayload(payload, includeExtendedFields))
    .eq("id", id);

  if (error) {
    throw error;
  }

  return normalized;
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
