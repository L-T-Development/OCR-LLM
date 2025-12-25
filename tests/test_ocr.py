import pytest
import pytesseract

def test_tesseract_availability():
    # This checks if Tesseract is actually installed on the server
    try:
        # If tesseract is missing, this command crashes
        pytesseract.get_tesseract_version()
        assert True
    except Exception as e:
        pytest.fail(f"Tesseract is NOT installed: {str(e)}")

def test_dummy_math():
    assert 1 + 1 == 2
