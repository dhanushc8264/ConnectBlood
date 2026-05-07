import sys
from analyzer import build_tree, get_js_files
from tester import generate_tests
from developer import modify_code


def enhance_requirements(req):
    return req.strip().lower()


def main():
    if len(sys.argv) < 2:
        print("❌ No requirements provided")
        sys.exit(1)

    requirements = enhance_requirements(sys.argv[1])

    print("✅ Step 1: Build project tree")
    tree = build_tree()

    print("✅ Step 2: Select JS files")
    js_files = get_js_files(tree)

    print("✅ Step 3: Generate tests")
    generate_tests(requirements)

    print("✅ Step 4: Modify code")
    modify_code(js_files, requirements)

    print("✅ Pipeline completed successfully")


if __name__ == "__main__":
    main()

