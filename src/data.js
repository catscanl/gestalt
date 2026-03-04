export const ROLES = [
  { id: "Admin", name: "Mum (Parent/Admin)" },
  { id: "Contributor", name: "David (LSA)" },
  { id: "SLT", name: "Sarah (SLT)" },
];

export const INITIAL_GESTALTS = [
  {
    id: "1",
    phrase: "Merry Christmas",
    source: "Peppa Pig (Christmas Episode)",
    meaning: "I am feeling overwhelmed or experiencing high arousal (joy/distress)",
    status: "Active",
    flaggedForSlt: true,
    createdAt: "2023-10-15T10:00:00Z",
    comments: [
      {
        id: "c1",
        author: "Mum",
        text: "Said this twice today when his tower fell over.",
        role: "Admin",
        time: "10:30 AM",
      },
      {
        id: "c2",
        author: "Sarah (SLT)",
        text: "Classic Stage 1. Let's try modeling \"Oh no, it fell!\" next time.",
        role: "SLT",
        time: "1:15 PM",
      },
    ],
  },
  {
    id: "2",
    phrase: "To infinity and beyond",
    source: "Toy Story",
    meaning: "I want to go outside / transition to a new activity",
    status: "Active",
    flaggedForSlt: false,
    createdAt: "2023-11-01T09:00:00Z",
    comments: [
      {
        id: "c3",
        author: "David (LSA)",
        text: "Used this when lining up for recess today.",
        role: "Contributor",
        time: "Yesterday",
      },
    ],
  },
  {
    id: "3",
    phrase: "Ready steady go",
    source: "Nursery rhymes",
    meaning: "Anticipation / wanting me to push him on swing",
    status: "Fading",
    flaggedForSlt: false,
    createdAt: "2023-08-20T14:00:00Z",
    comments: [],
  },
];
