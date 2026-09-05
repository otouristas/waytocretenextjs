"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";
import type { Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { REVIEW_WRITE } from "@/lib/site";
import { reviewPrompt } from "@/lib/reviews/prompt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GoogleWordmark, TripAdvisorOwl } from "@/components/trust/source-logos";

export type ExperienceOption = { value: string; label: string };

type Platform = "google" | "tripadvisor";

function todayIso() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

/**
 * Draft a Google or Tripadvisor review from the guest's own details.
 *
 * The clipboard text is a first-person review they can paste as-is. They
 * can edit it in the preview first. Nothing is posted or stored.
 */
export function WriteReviewCta({
  lang,
  experience,
  experiences = [],
  className = "",
}: {
  lang: Lang;
  /** Locked label when the surrounding page already is that experience. */
  experience?: string;
  experiences?: ExperienceOption[];
  className?: string;
}) {
  const ui = t(lang);
  const locked = experience?.trim() ?? "";
  const previewRef = useRef<HTMLTextAreaElement>(null);

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [picked, setPicked] = useState("");
  const [typedExperience, setTypedExperience] = useState("");
  const [hotel, setHotel] = useState("");
  const [host, setHost] = useState("");
  const [highlight, setHighlight] = useState("");
  const [copied, setCopied] = useState<Platform | null>(null);
  const [clipboardFail, setClipboardFail] = useState(false);

  const experienceLabel = locked
    ? locked
    : experiences.length > 0
      ? (experiences.find((item) => item.value === picked)?.label ?? "")
      : typedExperience;

  const ready =
    name.trim().length > 0 &&
    date.length > 0 &&
    experienceLabel.trim().length > 0 &&
    highlight.trim().length > 0;

  const generated = useMemo(() => {
    if (!ready) return "";
    return reviewPrompt({
      lang,
      name,
      date,
      experience: experienceLabel,
      hotel,
      host,
      highlight,
    });
  }, [ready, lang, name, date, experienceLabel, hotel, host, highlight]);

  const [draft, setDraft] = useState("");
  useEffect(() => {
    setDraft(generated);
  }, [generated]);

  async function copyAndOpen(platform: Platform) {
    const text = draft.trim();
    if (!ready || !text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(platform);
      setClipboardFail(false);
    } catch {
      setClipboardFail(true);
      const node = previewRef.current;
      if (node) {
        node.focus();
        node.select();
      }
    }
    window.open(REVIEW_WRITE[platform], "_blank", "noopener,noreferrer");
  }

  return (
    <div className={`rounded-2xl bg-surface p-6 ring-1 ring-line sm:p-7 ${className}`}>
      <p className="text-sm leading-relaxed text-muted">{ui.writeReviewLead}</p>

      <form
        className="mt-5 grid gap-3 sm:grid-cols-2"
        onSubmit={(event) => event.preventDefault()}
      >
        <Field label={ui.name}>
          <Input
            required
            autoComplete="given-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field label={ui.selectDate}>
          <Input
            required
            type="date"
            max={todayIso()}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </Field>

        <div className="sm:col-span-2">
          <Field label={ui.writeReviewExperience}>
            {locked ? (
              <Input readOnly value={locked} />
            ) : experiences.length > 0 ? (
              <select
                required
                value={picked}
                onChange={(e) => setPicked(e.target.value)}
                className="h-11 w-full rounded-md border border-line bg-bg px-3 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">{ui.writeReviewChoose}</option>
                {experiences.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                required
                value={typedExperience}
                onChange={(e) => setTypedExperience(e.target.value)}
              />
            )}
          </Field>
        </div>

        <Field label={ui.hotel}>
          <Input
            autoComplete="off"
            value={hotel}
            onChange={(e) => setHotel(e.target.value)}
          />
        </Field>
        <Field label={ui.writeReviewHost}>
          <Input value={host} onChange={(e) => setHost(e.target.value)} />
        </Field>

        <div className="sm:col-span-2">
          <Field label={ui.writeReviewHighlight}>
            <Textarea
              required
              rows={4}
              value={highlight}
              onChange={(e) => setHighlight(e.target.value)}
            />
          </Field>
        </div>
      </form>

      {generated ? (
        <div className="mt-4 grid gap-1.5">
          <Label htmlFor="review-prompt-preview">{ui.writeReviewPreview}</Label>
          <Textarea
            id="review-prompt-preview"
            ref={previewRef}
            rows={8}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="leading-relaxed"
          />
        </div>
      ) : null}

      {clipboardFail ? (
        <p className="mt-3 text-sm text-muted">{ui.writeReviewClipboardFail}</p>
      ) : null}

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          disabled={!ready || !draft.trim()}
          onClick={() => void copyAndOpen("google")}
          className="flex-1"
        >
          <GoogleWordmark className="h-4 w-auto" />
          {copied === "google" ? ui.writeReviewCopied : ui.writeOnGoogle}
          <ExternalLink className="size-3.5 opacity-70" />
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!ready || !draft.trim()}
          onClick={() => void copyAndOpen("tripadvisor")}
          className="flex-1"
        >
          <TripAdvisorOwl className="h-4 w-auto" />
          {copied === "tripadvisor" ? ui.writeReviewCopied : ui.writeOnTripadvisor}
          <ExternalLink className="size-3.5 opacity-70" />
        </Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}
