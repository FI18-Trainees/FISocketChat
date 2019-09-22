import unittest


class TestClass(unittest.TestCase):
    def test_start(self):
        with open("requirements.txt") as f:
            requirements = f.readlines()
        requirements = set([x.strip().lower() for x in requirements])
        with open("req.txt") as f:
            req = f.readlines()
        req = set([x.strip().lower() for x in req])

        print(f"Requirements: {requirements}")
        print("\n==============================\n")
        print(f"Req: {req}")

        self.assertEqual(req, requirements)


if __name__ == '__main__':
    unittest.main()
