"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { submitReviewAction } from "./actions";

interface ReviewFormProps {
  token: string;
  initialRating: number;
  defaultName: string;
  destinationName: string;
  alreadySubmitted: boolean;
}

export function ReviewForm({
  token,
  initialRating,
  defaultName,
  destinationName,
  alreadySubmitted,
}: ReviewFormProps) {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState(defaultName);
  const [comment, setComment] = useState("");
  const [done, setDone] = useState(alreadySubmitted);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (done) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
        <p className="text-2xl">⭐</p>
        <h2 className="mt-2 text-xl font-bold text-ink">Obrigado pela avaliação!</h2>
        <p className="mt-2 text-slate-600">
          Sua opinião foi recebida e será publicada após moderação.
        </p>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1) {
      setError("Selecione uma nota de 1 a 5 estrelas.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await submitReviewAction({ token, rating, comment, customerFirstName: name });
      if (result.error) setError(result.error);
      else setDone(true);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-slate-600">
        Como foi a internet na sua viagem para <strong>{destinationName}</strong>?
      </p>

      <div className="flex justify-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className="p-1 transition"
            aria-label={`${n} estrelas`}
          >
            <Star
              className={`h-10 w-10 ${
                n <= (hover || rating) ? "fill-yellow-400 text-yellow-400" : "text-slate-300"
              }`}
            />
          </button>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-ink">Seu primeiro nome</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={40}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink">
          Comentário <span className="font-normal text-slate-400">(opcional)</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          maxLength={500}
          placeholder="Conte como foi usar o eSIM no destino..."
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-accent py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
      >
        {pending ? "Enviando…" : "Enviar avaliação"}
      </button>
    </form>
  );
}
