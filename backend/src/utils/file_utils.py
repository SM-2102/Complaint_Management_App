import os
import re


def safe_join(base_dir, user_filename):
    """
    Safely join a base directory and a user-supplied filename, preventing path traversal and injection.
    Only allows filenames with alphanumeric, underscore, hyphen, dot, and space.
    """
    if not re.match(r"^[\w\-. ]+$", user_filename):
        raise ValueError("Invalid filename")
    full_path = os.path.normpath(os.path.join(base_dir, user_filename))
    if not os.path.commonpath(
        [os.path.abspath(base_dir), os.path.abspath(full_path)]
    ) == os.path.abspath(base_dir):
        raise ValueError("Path traversal detected")
    return full_path


def split_text_to_lines(text, font, font_size, max_width, string_width_func):
    """
    Splits text into lines that fit within max_width for the given font and size.
    string_width_func should be a function like reportlab.pdfbase.pdfmetrics.stringWidth.
    """
    words = (str(text) if text is not None else "").split()
    lines = []
    line = ""
    for word in words:
        test_line = (line + (" " if line else "") + word) if line or word else ""
        if string_width_func(test_line or "", font, font_size) <= max_width:
            line = test_line
        else:
            lines.append(line or "")
            line = word
    if line:
        lines.append(line or "")
    return lines
