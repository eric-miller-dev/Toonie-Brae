// Smooth scroll for nav + hero buttons
document.querySelectorAll("[data-scroll-target]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.getAttribute("data-scroll-target");
    if (!target) return;
    const el = document.querySelector(target);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

// Tribute form + sample dossier generation
const form = document.getElementById("tribute-form");
const clearBtn = document.getElementById("clearForm");
const previewSection = document.getElementById("preview");
const previewContent = document.getElementById("previewContent");

function getCheckedValues(name) {
  return Array.from(form.querySelectorAll(`input[name="${name}"]:checked`)).map(
    (el) => el.value
  );
}

function buildDossierPreview(data) {
  const {
    petName,
    petTitle,
    yourName,
    email,
    relationshipLength,
    interests,
    traits,
    notes,
  } = data;

  const lines = [];

  lines.push(`EVERLASTING INNER CIRCLE`);
  lines.push(`LEGACY DOSSIER – PREVIEW`);
  lines.push(`----------------------------------------`);
  lines.push(`Name: ${petName || "Your Companion"}`);
  lines.push(`Official Title: ${petTitle || "To Be Determined"}`);
  lines.push("");

  if (relationshipLength) {
    lines.push(`Years of Service: ${relationshipLength} years together`);
  } else {
    lines.push(`Years of Service: (we'll fill this in together)`);
  }

  if (interests.length) {
    lines.push("");
    lines.push(`Requested Memorials:`);
    interests.forEach((interest) => {
      switch (interest) {
        case "legacy-portrait":
          lines.push(`  • Legacy Portrait (framed photo with title)`);
          break;
        case "dossier":
          lines.push(`  • Dossier & Service Record`);
          break;
        case "bundle":
          lines.push(`  • Memorial Bundle`);
          break;
        case "digital":
          lines.push(`  • Digital Dossier`);
          break;
        default:
          lines.push(`  • ${interest}`);
      }
    });
  }

  lines
