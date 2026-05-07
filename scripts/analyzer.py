import os

def build_tree(base="repo"):
    files = []
    for root, _, filenames in os.walk(base):
        for f in filenames:
            files.append(os.path.relpath(os.path.join(root, f), base))
    return files

def get_js_files(tree):
    return [f for f in tree if f.endswith(".js")]
