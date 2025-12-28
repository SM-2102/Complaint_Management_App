from datetime import date, datetime
from typing import Optional, Union


def parse_date(date_input: Optional[Union[str, datetime, date]]) -> Optional[date]:
    """
    Converts a string in 'YYYY-MM-DD' format, a datetime, or a date object to a date object.
    Returns None if input is None or empty string.
    """
    if not date_input:
        return None
    if isinstance(date_input, date) and not isinstance(date_input, datetime):
        return date_input
    if isinstance(date_input, datetime):
        return date_input.date()
    if isinstance(date_input, str):
        try:
            return datetime.strptime(date_input, "%Y-%m-%d").date()
        except ValueError:
            raise ValueError(f"Invalid date string: {date_input}")
    raise TypeError(f"Unsupported type for parse_date: {type(date_input)}")


def format_date_ddmmyyyy(
    date_input: Optional[Union[str, datetime, date]],
) -> Optional[str]:
    """
    Converts a date, datetime, or 'YYYY-MM-DD' string to 'dd-mm-yyyy' string format.
    Returns None if input is None or empty string.
    """
    if not date_input:
        return None
    if isinstance(date_input, date) and not isinstance(date_input, datetime):
        d = date_input
    elif isinstance(date_input, datetime):
        d = date_input.date()
    elif isinstance(date_input, str):
        try:
            d = datetime.strptime(date_input, "%Y-%m-%d").date()
        except ValueError:
            raise ValueError(f"Invalid date string: {date_input}")
    else:
        raise TypeError(
            f"Unsupported type for format_date_ddmmyyyy: {type(date_input)}"
        )
    return d.strftime("%d-%m-%Y")
