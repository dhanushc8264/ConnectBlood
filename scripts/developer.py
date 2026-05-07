import os

def modify_code(files, requirements):
    for file in files:
        path = os.path.join("repo", file)

        if not os.path.exists(path):
            continue

        with open(path, "a") as f:
            f.write(f"\n// ✅ Updated for requirement: {requirements}\n")
