import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in environment.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const entries = [
  {
    phrase: "Wait a second / Waiting waiting waiting",
    source: "Adult",
    meaning: "Coping or signaling that something has gone wrong (context dependent)",
    communicationFunction: "Sharing feeling / processing",
    modelOptions: "Depends on context",
    stage: "1",
    dateOfEntry: "2026-01-28",
    inactiveDate: "",
    status: "Active",
  },
  {
    phrase: "Merry Christmas",
    source: "Twelve Days of Christmas / Jingle Bells",
    meaning: "Christmas time; can also mean stop it / I don't like it when upset",
    communicationFunction: "Sharing feeling / protesting",
    modelOptions: "Issue unresolved: sings whole phrase",
    stage: "1/2",
    dateOfEntry: "2026-01-28",
    inactiveDate: "2026-03-04",
    status: "Active",
  },
  {
    phrase: "Everybody stop",
    source: "Hands on top everybody stop (classroom song)",
    meaning: "Something is wrong or not right",
    communicationFunction: "Sharing feeling",
    modelOptions: "Sometimes says 'Hands on top' when issue isn't fixed",
    stage: "2",
    dateOfEntry: "2026-01-28",
    inactiveDate: "",
    status: "Active",
  },
  {
    phrase: "Bye bye hands",
    source: "Adult modelled in school",
    meaning: "Asking someone to stop or protest",
    communicationFunction: "Protesting / upset",
    modelOptions: "It's mine",
    stage: "1",
    dateOfEntry: "2026-01-28",
    inactiveDate: "",
    status: "Active",
  },
  {
    phrase: "Whoosh",
    source: "Adult modelled",
    meaning: "Something falling",
    communicationFunction: "Commenting",
    modelOptions: "It fell down; Whoosh it fell down; Oh no it fell down",
    stage: "2",
    dateOfEntry: "2026-01-28",
    inactiveDate: "",
    status: "Active",
  },
  {
    phrase: "Oh no",
    source: "Adult modelled",
    meaning: "Broken / fallen",
    communicationFunction: "Commenting",
    modelOptions: "",
    stage: "1",
    dateOfEntry: "2026-01-28",
    inactiveDate: "",
    status: "Active",
  },
  {
    phrase: "It's a Gruffalo",
    source: "From school/book and seeing a child dressed up",
    meaning: "Not within context; same context as Merry Christmas",
    communicationFunction: "Upset",
    modelOptions: "",
    stage: "2",
    dateOfEntry: "2026-03-04",
    inactiveDate: "",
    status: "Active",
  },
  {
    phrase: "It's an elephant calf",
    source: "Leapfrog baby animals interactive book",
    meaning: "Not within context; same context as Merry Christmas",
    communicationFunction: "Upset / happy?",
    modelOptions: "",
    stage: "1",
    dateOfEntry: "2026-03-04",
    inactiveDate: "",
    status: "Active",
  },
  {
    phrase: "It's a tiger cub",
    source: "Leapfrog baby animals interactive book",
    meaning: "Not within context; same context as Merry Christmas",
    communicationFunction: "Upset / happy?",
    modelOptions: "Not resolved",
    stage: "1",
    dateOfEntry: "2026-03-04",
    inactiveDate: "",
    status: "Active",
  },
  {
    phrase: "No TA",
    source: "Other children",
    meaning: "In response: let me do it",
    communicationFunction: "Self advocacy",
    modelOptions: "Delayed and immediate",
    stage: "1",
    dateOfEntry: "2026-03-04",
    inactiveDate: "",
    status: "Active",
  },
  {
    phrase: "Don't touch it",
    source: "Adult",
    meaning: "Within context to other child",
    communicationFunction: "Self advocacy",
    modelOptions: "",
    stage: "1",
    dateOfEntry: "2026-03-04",
    inactiveDate: "",
    status: "Fading",
  },
  {
    phrase: "X in the box",
    source: "Adult modelled",
    meaning: "Play within context; mostly referencing animal",
    communicationFunction: "Play",
    modelOptions: "Also used when tidying up",
    stage: "2",
    dateOfEntry: "2026-03-04",
    inactiveDate: "",
    status: "Active",
  },
  {
    phrase: "Oh no it fell down",
    source: "Adult modelled target",
    meaning: "Within context",
    communicationFunction: "Commenting",
    modelOptions: "",
    stage: "2",
    dateOfEntry: "2026-03-04",
    inactiveDate: "",
    status: "Fading",
  },
  {
    phrase: "Yay",
    source: "Adult modelled target",
    meaning: "Within context, playground (seesaw/slide)",
    communicationFunction: "Shared enjoyment",
    modelOptions: "It's so fun; Weee",
    stage: "1",
    dateOfEntry: "2026-03-04",
    inactiveDate: "",
    status: "Fading",
  },
  {
    phrase: "**uck / Oh **it",
    source: "Environment",
    meaning: "Within context when something falls or can't do something",
    communicationFunction: "Expressing frustration",
    modelOptions: "Not pronounced",
    stage: "1",
    dateOfEntry: "2026-03-04",
    inactiveDate: "",
    status: "Active",
  },
  {
    phrase: "Open it",
    source: "Adult model (at home - package)",
    meaning: "Within context",
    communicationFunction: "Requesting",
    modelOptions: "",
    stage: "1",
    dateOfEntry: "2026-03-04",
    inactiveDate: "",
    status: "Active",
  },
  {
    phrase: "Read it",
    source: "Adult model",
    meaning: "Within context",
    communicationFunction: "Requesting",
    modelOptions: "we read it",
    stage: "2 (trim)",
    dateOfEntry: "2026-03-04",
    inactiveDate: "",
    status: "Active",
  },
  {
    phrase: "X in the sky it falls down",
    source: "Adult model",
    meaning: "Within context",
    communicationFunction: "Play",
    modelOptions: "",
    stage: "2",
    dateOfEntry: "2026-03-04",
    inactiveDate: "",
    status: "Active",
  },
  {
    phrase: "It's cold / It's wet / It's so cold / Yucky",
    source: "Adult model",
    meaning: "Within context (e.g., jacket, wet sand)",
    communicationFunction: "Describing / regulation",
    modelOptions: "",
    stage: "1",
    dateOfEntry: "2026-03-04",
    inactiveDate: "",
    status: "Active",
  },
];

function norm(value) {
  return (value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function toInsertRow(entry, includeExtendedFields) {
  const row = {
    phrase: entry.phrase,
    source: entry.source || "",
    meaning: entry.meaning || "",
    status: ["Active", "Fading", "Archived"].includes(entry.status) ? entry.status : "Active",
    flagged_for_slt: false,
    created_by: "Cathy",
    created_by_role: "Admin",
  };

  if (includeExtendedFields) {
    row.communication_function = entry.communicationFunction || "";
    row.model_options = entry.modelOptions || "";
    row.stage = entry.stage || "";
    row.date_of_entry = entry.dateOfEntry || null;
    row.inactive_date = entry.inactiveDate || null;
  }

  return row;
}

async function main() {
  const { data: existing, error: fetchError } = await supabase
    .from("gestalts")
    .select("id, phrase, source, meaning");

  if (fetchError) {
    throw fetchError;
  }

  let includeExtendedFields = true;
  const { error: probeError } = await supabase
    .from("gestalts")
    .select("id, communication_function, model_options, stage, date_of_entry, inactive_date")
    .limit(1);

  if (probeError) {
    includeExtendedFields = false;
  }

  const existingKeys = new Set(
    (existing || []).map((row) => `${norm(row.phrase)}|${norm(row.source)}|${norm(row.meaning)}`),
  );

  const rowsToInsert = [];
  for (const entry of entries) {
    const key = `${norm(entry.phrase)}|${norm(entry.source)}|${norm(entry.meaning)}`;
    if (!existingKeys.has(key)) {
      rowsToInsert.push(toInsertRow(entry, includeExtendedFields));
      existingKeys.add(key);
    }
  }

  if (rowsToInsert.length === 0) {
    console.log("No new rows to insert.");
    return;
  }

  const { error: insertError } = await supabase.from("gestalts").insert(rowsToInsert);

  if (insertError) {
    throw insertError;
  }

  console.log(`Inserted ${rowsToInsert.length} gestalt rows.`);
}

main().catch((error) => {
  console.error("Import failed:", error.message || error);
  process.exit(1);
});
