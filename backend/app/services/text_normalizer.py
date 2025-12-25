import re
import pymorphy2

morph = pymorphy2.MorphAnalyzer()

class TextNormalizer:
    def russian_tokens(self, text: str):
        words = re.findall(r"[А-Яа-яЁё]+", text)
        lemmas = set()
        for w in words:
            p = morph.parse(w)[0]
            if p.tag.POS in {"NOUN", "ADJF"}:
                lemmas.add(p.normal_form)
        return list(lemmas)

    def english_tokens(self, text: str):
        words = re.findall(r"[A-Za-z]+", text.lower())
        return set(words)
