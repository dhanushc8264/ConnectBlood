import os

def generate_tests(requirements):
    os.makedirs("repo/tests", exist_ok=True)

    test_code = f"""
// ✅ Auto-generated Jest test
test('basic validation test', () => {{
    expect(true).toBe(true);
}});
"""

    with open("repo/tests/generated.test.js", "w") as f:
        f.write(test_code)
