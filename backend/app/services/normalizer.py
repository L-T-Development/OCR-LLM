import inspect
from collections import namedtuple

# ---- PROPER Python 3.11 compatibility shim ----
if not hasattr(inspect, "getargspec"):
    ArgSpec = namedtuple("ArgSpec", "args varargs keywords defaults")

    def getargspec(func):
        spec = inspect.getfullargspec(func)
        return ArgSpec(
            args=spec.args,
            varargs=spec.varargs,
            keywords=spec.varkw,
            defaults=spec.defaults,
        )

    inspect.getargspec = getargspec
# ---------------------------------------------

import pymorphy2


class RussianNormalizer:
    def __init__(self):
        self.morph = pymorphy2.MorphAnalyzer()

    def normalize(self, word: str) -> str:
        parsed = self.morph.parse(word)
        if not parsed:
            return word.lower()
        return parsed[0].normal_form
