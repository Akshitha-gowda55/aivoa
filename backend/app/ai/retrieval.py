from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

KNOWLEDGE_BASE_PATH = (
    Path(__file__).resolve().parents[2] / "knowledge" / "knowledge_base.json"
)


def _tokenize(text: str) -> set[str]:
    return {
        token
        for token in re.findall(r"[a-zA-Z0-9]+", text.lower())
        if len(token) > 2
    }


def _load_knowledge_base() -> list[dict[str, Any]]:
    with KNOWLEDGE_BASE_PATH.open("r", encoding="utf-8") as file:
        return json.load(file)


def _build_query(
    *,
    site: str | None,
    title: str | None,
    source: str | None,
    product: str | None,
    batch_number: str | None,
    description: str | None,
) -> str:
    values = [
        site,
        title,
        source,
        product,
        batch_number,
        description,
    ]

    return " ".join(value for value in values if value)


def _contains_any(text: str, phrases: list[str]) -> bool:
    normalized = text.lower()
    return any(phrase in normalized for phrase in phrases)


def _contradiction_penalty(
    query: str,
    record_text: str,
) -> float:
    """
    Penalize knowledge records whose main pattern conflicts with explicit
    facts in the current deviation.

    This does not delete contradictory records. It simply prevents them from
    outranking records that describe the same actual pattern.
    """

    penalty = 0.0

    current_no_confirmed_impact = _contains_any(
        query,
        [
            "no confirmed product quality impact",
            "no confirmed quality impact",
            "no confirmed product-quality impact",
            "quality impact has not been confirmed",
            "impact has not been confirmed",
        ],
    )

    record_confirmed_impact = _contains_any(
        record_text,
        [
            "confirmed quality impact",
            "confirmed product-quality impact",
            "confirms an adverse quality effect",
            "confirmed product quality impact",
        ],
    )

    if current_no_confirmed_impact and record_confirmed_impact:
        penalty += 0.35

    current_single_batch = _contains_any(
        query,
        [
            "batch batch-",
            "single batch",
        ],
    )

    record_repeated = _contains_any(
        record_text,
        [
            "repeatedly",
            "multiple batches",
            "recurrence",
            "systemic",
        ],
    )

    if current_single_batch and record_repeated:
        penalty += 0.15

    return penalty


def _pattern_bonus(
    query: str,
    record_text: str,
) -> float:
    """
    Reward records that match explicit characteristics of the current event.
    """

    bonus = 0.0

    pattern_groups = [
        (
            [
                "temperature",
                "granulation",
            ],
            [
                "temperature",
                "granulation",
            ],
            0.12,
        ),
        (
            [
                "routine monitoring",
                "detected by routine monitoring",
            ],
            [
                "routine monitoring",
                "routine detection",
            ],
            0.10,
        ),
        (
            [
                "approximately 8 minutes",
                "approx 8 minutes",
                "8 minutes",
                "short duration",
            ],
            [
                "short documented period",
                "short duration",
                "8 minutes",
            ],
            0.10,
        ),
        (
            [
                "no confirmed product quality impact",
                "no confirmed quality impact",
            ],
            [
                "no confirmed product-quality impact",
                "no confirmed product quality impact",
                "evidence gap",
            ],
            0.12,
        ),
    ]

    query_lower = query.lower()
    record_lower = record_text.lower()

    for query_phrases, record_phrases, weight in pattern_groups:
        query_match = any(
            phrase in query_lower for phrase in query_phrases
        )
        record_match = any(
            phrase in record_lower for phrase in record_phrases
        )

        if query_match and record_match:
            bonus += weight

    return bonus


def retrieve_knowledge(
    *,
    site: str | None,
    title: str | None,
    source: str | None,
    product: str | None,
    batch_number: str | None,
    description: str | None,
    limit: int = 5,
) -> list[dict[str, Any]]:
    """
    Retrieve supporting knowledge using deterministic hybrid scoring.

    Ranking combines:
    - token overlap
    - topic/tag matches
    - explicit pattern matches
    - contradiction penalties

    Retrieved records are supporting evidence only. They are not treated as
    facts about the current deviation.
    """

    query = _build_query(
        site=site,
        title=title,
        source=source,
        product=product,
        batch_number=batch_number,
        description=description,
    )

    query_tokens = _tokenize(query)

    if not query_tokens:
        return []

    records = _load_knowledge_base()
    scored_records: list[tuple[float, dict[str, Any]]] = []

    for record in records:
        searchable_text = " ".join(
            [
                record.get("title", ""),
                record.get("topic", ""),
                " ".join(record.get("tags", [])),
                record.get("content", ""),
            ]
        )

        record_tokens = _tokenize(searchable_text)

        if not record_tokens:
            continue

        overlap = query_tokens.intersection(record_tokens)

        if not overlap:
            continue

        score = len(overlap) / max(len(query_tokens), 1)

        topic = record.get("topic", "").lower()
        tags = {
            tag.lower()
            for tag in record.get("tags", [])
        }

        query_lower = query.lower()

        if topic and topic in query_lower:
            score += 0.20

        matching_tags = sum(
            1
            for tag in tags
            if tag in query_lower
        )

        score += min(matching_tags * 0.05, 0.20)

        score += _pattern_bonus(
            query,
            searchable_text,
        )

        score -= _contradiction_penalty(
            query,
            searchable_text,
        )

        score = max(score, 0.0)

        scored_records.append((score, record))

    scored_records.sort(
        key=lambda item: (
            item[0],
            not item[1].get("is_synthetic", False),
        ),
        reverse=True,
    )

    results: list[dict[str, Any]] = []

    for score, record in scored_records[:limit]:
        results.append(
            {
                "id": record["id"],
                "authority": record["authority"],
                "source_type": record["source_type"],
                "title": record["title"],
                "topic": record["topic"],
                "content": record["content"],
                "source_url": record.get("source_url"),
                "is_synthetic": record.get("is_synthetic", False),
                "match_score": round(score, 4),
            }
        )

    return results
