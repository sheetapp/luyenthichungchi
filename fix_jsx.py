import os

file_path = r'e:\2026\Webapp\15. Sát hach CCHN\luyenthichungchixd\app\(main)\thi-thu\[examId]\page.tsx'

if not os.path.exists(file_path):
    print(f"File not found: {file_path}")
    exit(1)

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the specific malformed tag with space
# Also handle potential variations like tabs or multiple spaces
import re
new_content = re.sub(r'</div\s+>', '</div>', content)

# Also check for any extra tags at the very end
# Based on analysis, there should be one </div> after the modals.
# We'll look at the last few lines.
lines = new_content.splitlines()
last_lines = lines[-10:]
print("Original last 5 lines:")
for l in lines[-5:]:
    print(f"[{l}]")

# We expect:
# )
# }
# So we need one </div> before )

# Let's find the position of the last modal close )} 
m = list(re.finditer(r'}\s*\)\s*}', new_content))
if m:
    last_idx = m[-1].end()
    final_part = new_content[last_idx:]
    # Check if there are too many </div> tags in final_part
    div_count = final_part.count('</div>')
    print(f"Found {div_count} closing div tags after last modal block.")
    if div_count > 1:
        print("Reducing to 1 closing div tag.")
        # Reconstruct final part with only one div
        new_final = "\n        </div>\n    )\n}\n"
        new_content = new_content[:last_idx] + new_final

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Replacement complete.")
