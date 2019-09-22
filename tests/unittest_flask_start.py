import unittest
from unittest.mock import patch
import module_under_test


class TestClass(unittest.TestCase):
    @patch("time.sleep", side_effect=InterruptedError)
    def test_start(self, mocked_sleep):
        print("Start")
        obj = module_under_test.Observer()
        try:
            obj.infinite_loop()
        except InterruptedError:
            pass
        self.assertFalse(obj.running)


if __name__ == '__main__':
    unittest.main()
