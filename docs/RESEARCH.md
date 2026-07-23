# Research notes

[Back to the README](../README.md) ·
[View the canonical skill](../skills/how-to-read/SKILL.md)

How to Read is a response-formatting preference.
It is not medical treatment, a diagnostic tool, or a guarantee of comprehension.

The skill combines Morris Hannessen's reading preferences with accessibility
guidance and educational research. Applying findings from web content and
instructional materials to AI responses is an informed design inference. The
available studies do not directly test this skill.

## Evidence-to-rule mapping

| Skill behavior | Evidence and source type | What the source supports | Important limitation |
|---|---|---|---|
| Use clear words, short blocks, headings, summaries, whitespace, and supportive visuals | [W3C Clear Content](https://www.w3.org/WAI/WCAG2/supplemental/objectives/o3-clear-content/), [W3C Writing Accessibility](https://www.w3.org/WAI/tips/writing/), and [W3C COGA](https://www.w3.org/TR/coga-usable/) — authoritative accessibility guidance | These patterns help people navigate and understand web content, including people with cognitive and learning disabilities. | Guidance synthesizes standards work and user needs; it is not a controlled trial of AI responses. |
| Use simple precise forms, explicit logical links, clear references, and consistent labels | [W3C technique G153](https://www.w3.org/WAI/WCAG22/Techniques/general/G153) — authoritative accessibility technique | W3C recommends indicating relationships, making pronoun references clear, using consistent labels, and simplifying without losing meaning. | W3C techniques are sufficient examples, not mandatory rules or proof that a fixed word limit works for everyone. |
| Adapt assistance to likely reader knowledge | [Tetzlaff et al.](https://doi.org/10.1016/j.learninstruc.2025.102142) — meta-analysis of 60 experimental studies | Lower-knowledge learners benefited from higher assistance, while higher-knowledge learners benefited from lower assistance. | The studies concern instruction across varied domains, not conversational AI. Knowledge must be inferred cautiously unless the user states it. |
| Emphasize selected ideas without a quota | [Ponce, Mayer, and Méndez](https://eric.ed.gov/?id=EJ1334669) — meta-analysis of 36 articles and 85 effect sizes | Instructor-provided highlighting improved memory and comprehension in educational texts on average. | The result does not establish an ideal amount of bold text or guarantee a benefit in every format. |
| Use visuals to clarify relationships and give a text equivalent | [Richter, Scheiter, and Eitel](https://doi.org/10.1016/j.edurev.2015.12.003) — meta-analysis; [W3C text alternatives](https://www.w3.org/WAI/WCAG20/Understanding/text-alternatives) — accessibility guidance | Signaling text-picture relationships had a small-to-medium positive effect on comprehension and transfer, especially for lower prior knowledge. Text alternatives keep visual information available in other forms. | Decorative or redundant visuals can add load. The meta-analysis studied multimedia instruction rather than AI chat. |
| Break complex material into meaningful units | [Rey et al.](https://doi.org/10.1007/s10648-018-9456-4) — meta-analysis | Segmenting instructional material improved retention and transfer on average and reduced cognitive load. | Segmenting should preserve complete ideas and runnable code; excessive fragmentation can damage coherence. |
| Make causal, contrastive, and sequential relationships explicit | [W3C technique G153](https://www.w3.org/WAI/WCAG22/Techniques/general/G153) — accessibility guidance; [Wiseheart et al.](https://pubmed.ncbi.nlm.nih.gov/19911285/) — controlled sentence-comprehension study | Explicit structure reduces avoidable inference, while syntactic complexity can create greater difficulty under higher working-memory demands for adults with dyslexia. | One sentence study does not prove that a single syntax style works for all readers. |
| Use retrieval prompts only for explicit learning requests | [Karpicke and Blunt](https://pubmed.ncbi.nlm.nih.gov/21252317/) — controlled experiment | Retrieval practice produced stronger meaningful learning than elaborative studying with concept mapping in the tested materials. | This supports optional practice, not unsolicited quizzes or every learning context. |
| Avoid claims for Bionic Reading | [Snell](https://doi.org/10.1016/j.actpsy.2024.104304) — controlled reading-time study | Bolding the first part of every word did not improve reading time compared with ordinary text. | The experiment focused on reading time and does not rule out individual preferences. Selective phrase emphasis is a different intervention. |
| Avoid prescribing a special dyslexia font | [Kuster et al.](https://doi.org/10.1007/s11881-017-0154-6) and [Wery and Diliberto](https://pmc.ncbi.nlm.nih.gov/articles/PMC5629233/) — controlled font studies | Dyslexie and OpenDyslexic did not show a general reading-performance advantage over comparison fonts. | Individual comfort can still differ, so user preference should override the default. |

## How to interpret the evidence

- **W3C guidance** is authoritative accessibility guidance. It describes
  recommended patterns and user needs, not guaranteed effect sizes.
- The [British Dyslexia Association style guide](https://cdn.bdadyslexia.org.uk/uploads/documents/Advice/style-guide/BDA-Style-Guide-2023.pdf)
  is practitioner guidance for dyslexia-friendly presentation. It supports
  clear language, whitespace, headings, lists, and bold rather than italic
  emphasis, but it is not an experimental study.
- **Meta-analyses** aggregate educational studies and provide broader evidence
  than individual experiments. Their findings still depend on materials,
  readers, domains, and outcome measures.
- **Individual studies** answer narrower questions. They should constrain
  claims rather than become universal rules.
- **User testing remains necessary.** W3C recommends involving people with
  cognitive and learning disabilities because needs and preferences differ.

These limits are why the skill uses flexible guidance, honors explicit
preferences, and places accuracy above formatting.
